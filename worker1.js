// worker for cores_est.js 
av = 1	
INF = 9999999999
delta = 1500 //ms

start = new Date().getTime()
for (a=1;a<INF;a++){
	b = Math.sqrt (a*100) // nieco
	if (a % 1000 == 0){
		cur = new Date().getTime()
		if (cur - start > delta){
			break;
		}
	}
	
}

postMessage(a)
