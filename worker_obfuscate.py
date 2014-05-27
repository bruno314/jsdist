import hashlib,random
 
 # prefix verification assumed (TODO)
obf_vars = filter (None, [ line.split("=")[0].strip() for line in open ("beta_worker.js").read().split("//OBF_START")[1].split("//OBF_END")[0].split("\n") ])

out_source = open ("beta_worker.js").read()
for a in range (0,len(obf_vars)-1+1): #!
	print "Obfuscating",obf_vars[a]
	replace_by = "Q"+hashlib.md5(str(random.random())).hexdigest().upper() #hash moze zacat digit
	out_source = out_source.replace(obf_vars[a],replace_by)
	out_source = out_source.replace("\""+replace_by+"\"","\""+obf_vars[a]+"\"")


c = open ("beta_worker_obf.js","w")
c.write(out_source)
c.close()






