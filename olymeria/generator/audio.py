import numpy as np, wave, sys
OUT=sys.argv[1]; SEMI=int(sys.argv[2]) if len(sys.argv)>2 else 0; K=2**(SEMI/12)
SR=44100; D=20.0; N=int(SR*D); mix=np.zeros(N)
def add(sig,t,g=1.0):
    i=int(t*SR); e=min(N,i+len(sig))
    if i<N: mix[i:e]+=sig[:e-i]*g
def tone(f,d,dec=6,kind='sin'):
    t=np.arange(int(d*SR))/SR; env=np.exp(-dec*t)*np.minimum(1,t/0.004)
    s=np.sin(2*np.pi*f*t)+(0.3*np.sin(4*np.pi*f*t) if kind=='rich' else 0)
    return s*env
def kick():
    t=np.arange(int(.22*SR))/SR; return np.sin(2*np.pi*(48*t+ 60*(1-np.exp(-30*t))/30))*np.exp(-14*t)
def hat():
    t=np.arange(int(.05*SR))/SR; return np.random.default_rng(1).normal(size=len(t))*np.exp(-90*t)
A=55.0*K; bass=[A,A,A*1.189,A*.891]
# Bed: 120 BPM pulse, drops out for the reveal hit
beat=.5
for k in range(int(D/beat)):
    t=k*beat
    if 8.5<=t<9.4: continue
    add(kick(),t,.55 if t>=3.5 else .35)
    add(hat(),t+beat/2,.10)
    if k%2==0:
        f=bass[(k//8)%4]; add(tone(f,.9,2.2,'rich'),t,.30)
# Options appear
for i,n in enumerate([523,587,659,784]): add(tone(n*K,.18,16),2+i*.28,.35)
# Countdown ticks, rising on the last two
for i,t in enumerate([3.5,4.5,5.5,6.5,7.5]): add(tone(1200 if i<3 else 1600,.07,50),t,.45)
# Reveal chord
for f in (523.25,659.25,783.99,1046.5): add(tone(f*K,1.4,2.6,'rich'),8.5,.26)
# Globe flight whoosh
n=int(3.2*SR); w=np.random.default_rng(2).normal(size=n)
x=np.linspace(0,1,n); cut=.01+.14*x**2; y=np.zeros(n); s=0
for i in range(n): s+=cut[i]*(w[i]-s); y[i]=s
add(y*np.sin(np.pi*x)**1.5*3,9.4,.5)
# Landing, label, count-up, end
add(kick(),12.6,.8); add(tone(880,.5,5,'rich'),12.05,.25)
for k,t in enumerate(np.arange(13.4,14.6,.08)): add(tone(900+k*40,.04,70),float(t),.16)
for f in (659.25,987.77): add(tone(f*K,.9,3.5),17.1,.28)
fade=np.ones(N); m=int(.7*SR); fade[-m:]=np.linspace(1,0,m)
mix*=fade; mix/=np.abs(mix).max()*1.05
st=np.stack([mix,mix],1); pcm=(st*32767).astype('<i2')
with wave.open(OUT,'wb') as f:
    f.setnchannels(2); f.setsampwidth(2); f.setframerate(SR); f.writeframes(pcm.tobytes())
