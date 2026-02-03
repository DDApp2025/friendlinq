
let arrayToString = function (data){
    let lengthofArray = data.length;
    let convertedString='';
    for(i=0;i<lengthofArray; i++){
    	if(i==0){  
    		convertedString ="'"+data[i]+"'";
    	}else{  
    		convertedString =convertedString+",'"+data[i]+"'";
    	}
       
    };console.log("data==",convertedString);
}


arrayToString(['Aisa'])