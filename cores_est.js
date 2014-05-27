		var speedup;
		speedup_thre = 0.3;
		function finish_report (){
			for (a=2;a<=const_do_phases;a++){
				speedup = resultDB[a]/resultDB[a-1];
				if (speedup < 1 + speedup_thre){
					__callback(a-1);
					break;
				}
			}
		}
		
		function vfy_response (){
			if (amt_got == phase){
				// OK;
				console.log (phase + "cores " + sum_got)
				resultDB[phase] = sum_got;
				if (phase < const_do_phases) {phase += 1; start_workers (phase) } else {finish_report();}
			}
			else {
				alert ("? worker"); //nemalo by nastat nikdy
			}
			
		}
		
		function start_workers (n){
			workers = new Array();
			amt_got = 0
			sum_got = 0
			
			
			for (a=1;a<=n;a++){
				workers[a] = new Worker ('worker1.js');
				workers[a].onmessage = function (event) {
					//alert (event.data)
					amt_got += 1
					sum_got += event.data
				}	
			}
			setTimeout ("vfy_response()",2500);
		}
		
		phase = 1;
		const_do_phases = 4;
		amt_got = 0
		sum_got = 0
		workers = new Array();
		resultDB = new Array();
		
 		
