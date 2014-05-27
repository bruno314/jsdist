//beta_worker.js

//public
machine_index = 0
monitor_vars = [] 



function Pmonitor(co){ // add
	monitor_vars.push(co)
}




//OBF_START
ESTIMATE_EVERY = 5000
SLICE_DEADLINE = 100 //ms
REPORT_DEADLINE = 2000 // !! DEFINED in upper
REPORT_DILLIGENCE = REPORT_DEADLINE/2
RR_ROUND = 150

flag_stop_computation = false;
worker_id = -1

last_report_alive_status = 0
last_estimation = 0

worked_wo_break = 0;
Qrun = user_main

verify_in_eval_mode = false;
__post_message = 0
__set_interval = 0
__set_timeout = 0
__eval = 0

computed_coef_rr = 1;

//Qcompute_delay_factor = 0
//Qreport_alive_status  = 0
//Qsession_store = 0
//Qfreeze_computation = 0
//Qtry_unfreeze_computation = 0
//Qinit = 0
//Qverify = 0
//OBF_END


function Qcompute_delay_factor (){
	//TODO
	computed_coef_rr = 1
}


function now(){
	return (new Date).getTime()
}

function d(msg){
	__post_message({"wid":worker_id,"cmd":"debug","text":msg.toString()});
}



function Qreport_alive_status (){
	//__post_message ("ALIVE");
	__post_message ({"cmd":"alive","wid":worker_id})
	last_report_alive_status = now()
	// TODO
}

function Qsession_store (ss_key,ss_val){
	__post_message({"cmd":"store","ss_key":ss_key,"ss_val":ss_val})
}



function Qfreeze_computation(){
	global_export = {}
	d("@freeze")
	for (index in monitor_vars){
		varname = monitor_vars[index]
		//  eval danger
		if (/[^a-zA-Z0-9_]/.test( varname)) {// malicious? 
		} else{
			d ("getting content of "+varname)
			__eval ("cont = JSON.stringify(" + varname + ");")
			d("cont="+cont);
			global_export[varname] = cont
		}
	}
	/* nemame localstorage access
	sessionStorage.frozen = 1
	if (sessionStorage.freeze[0] != "init") {sessionStorage.freeze = []}
	if (sessionStorage.meta[0] != "init") {sessionStorage.meta = []}
	sessionStorage.freeze[worker_id] = JSON.stringify (global_export) // do spravneho priecinka stav vypoctu
	sessionStorage.meta[worker_id] = JSON.stringify({"run":run})
	*/

	Qsession_store("freeze"+worker_id,JSON.stringify (global_export))
	
	//pri unfreeze spustime cez eval konstrukciu
	Qsession_store("meta"+worker_id,JSON.stringify(({"run":Qrun.name})))

}


function Qtry_unfreeze_computation(_import_freeze){
	d("@unfreeze")
	
		//saved_meta_dic = JSON.parse (sessionStorage.meta[worker_id])  // run je uz parsed ?
		//run = saved_meta_dic['run']

		saved_vars_dic = _import_freeze
		
		for (varname in saved_vars_dic){
			_typeArray = saved_vars_dic[varname] instanceof Array;
			// if (_typeArray){  //JSON array bug !?
			d (varname+":"+saved_vars_dic[varname])

			__eval (varname+"=JSON.parse('"+saved_vars_dic[varname]+"');")

				//d("restored "+varname+" to ["+saved_vars_dic[varname]+"] (array mode)");
				
			//}else{
			//	__eval (varname+"="+saved_vars_dic[varname]+";")
			//	d("restored "+varname+" to"+saved_vars_dic[varname]);
			//}
			

		
		}
}
function Qinit(){

	__post_message = postMessage
	__set_timeout = setTimeout
	__set_interval = setInterval
	__eval = eval

	postMessage=0;
	setTimeout=0
	setInterval=0
	eval=0

	Qrun = user_main

	//Qtry_unfreeze_computation()

	

	
	worked_wo_break = 0
	Qreport_alive_status ()
}



function Qverify (){
	while (true){
		d("New round")
		computation_start = (new Date()).getTime()
		if (verify_in_eval_mode){
			d("In eval mode__")
			verify_in_eval_mode = false;

			
			Qrun = __eval (Qrun+"()")
			
			
		} else {
			Qrun = Qrun()	
		}
		
		delta_worked = now() - computation_start
		if (flag_stop_computation){ //stop computation, (reset RR params)
			Qfreeze_computation()
			break; //=die
		}

		//throw JSON.stringify ("checkpoint")
		d("delta_worked="+delta_worked)
		//  timeslice 
		if (delta_worked > SLICE_DEADLINE){
			// TERMINATE
			d("Slice deadline expired");
		}
		tmpnow = now()
		if (tmpnow - last_report_alive_status > REPORT_DILLIGENCE){
			d("Reporting alive status"+now())
			Qreport_alive_status()
		}

		if (tmpnow - last_estimation > ESTIMATE_EVERY){
				d("Estimate")
				Qcompute_delay_factor()

				last_estimation = (new Date()).getTime()
		}

		worked_wo_break += delta_worked
		
		if (worked_wo_break > RR_ROUND){
			
			//computed_coef_rr = Qcompute_delay_factor()
			delay = Math.floor(worked_wo_break*computed_coef_rr)
			worked_wo_break = 0 // mv pred sT
			d("RR Sleep ...")
			__set_timeout(Qverify,delay) 
			break; //toto vlakno veirify skonci
		} else{
			// jump na zaciatok while bez straty
		}



	}


}

Qinit()

	self.addEventListener ('message',function (e) {
		if (e.data['cmd']=='set_wid') {worker_id = e.data['text']; d("Now has id"+worker_id)}
		if (e.data['cmd']=='freeze') {flag_stop_computation=true; d("got TERMINATE flag")}
		if (e.data['cmd']=='ss_status') {
			if (e.data['text']){
				// start kde sme skoncili
				 _import_meta  = JSON.parse(e.data['data_meta'])
				 _import_freeze = JSON.parse(e.data['data_freeze'])

				 Qrun = _import_meta['run'] //  meta 

				 Qtry_unfreeze_computation(_import_freeze)
				 verify_in_eval_mode = true;	
				 Qverify();

			}else{
				// nebol frozen
				Qverify()
			}
		}
	 }
	,false)



//verify() //verify az po nacitani (blank) frozen vypoctu



// import user function 

prem1 = 0	
prem2 = 0	
prem_pole = [1,2,3]
prem_map = {"a":"c","b":"d"}

Pmonitor("prem1")
Pmonitor("prem2")
Pmonitor("prem_pole")
Pmonitor("prem_map")

var oReq = new XMLHttpRequest();
oReq.onload = system_fetch_callback;

function system_fetch (){
	oReq.open("get", "dispenser.php", true);
	oReq.send();
}

function system_fetch_callback(){
	fetched = this.responseText;
	data_arrived = true;
}

function user_nonmain (){

	if (data_arrived) {
		for (b=1;b<=5000000;b++){
			//ratame s b
			c=b*b
		}

		prem1++;
		if (prem1%10==0){
			__post_message({'cmd':'demo','demoval':prem1.toString()+" Dispenser:"+fetched,"wid":worker_id});
			system_fetch();
		}
		return user_main;
	} else {
		// 100% loop;  fixable via scheduler
	}
	return user_main
}

function user_main(){
	for (a=1;a<=5000000;a++){
		//ratame s a
		c=a*a

	}

	prem2--;

	return user_nonmain;
}

data_arrived = false;
system_fetch();
fetched = 0