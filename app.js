
require('dotenv').config()
const express = require('express')
const https = require('https')
const client = require("@mailchimp/mailchimp_marketing");
const port = process.env.PORT || 3000;

app = express();

app.use(express.urlencoded({extended: true}));
app.use(express.static("public"));

app.listen(port, function(){
	console.log(`Server running on port ${port}`);
});

app.get("/", function(req, res){
	res.sendFile(`${__dirname}/signup.html`);
});

app.post("/failure", (req, res) => {
	res.redirect("/");
});

app.post("/", function(req, res){
	const firstName = req.body.firstname;
	const lastName = req.body.lastname;
	const email = req.body.email;

	client.setConfig({
  	apiKey: process.env.API_KEY,
  	server: "us6",
	});

	const run = async () => {
		const response = await client.lists.batchListMembers(process.env.LIST_ID, {
	    members: [
				{
					email_address: email,
					status: "subscribed",
					merge_fields: {
						FNAME: firstName,
						LNAME: lastName
					}
				}
			],
	  	});

	  	if(response.total_created != 0){
	  		res.sendFile(`${__dirname}/success.html`);
	  	}else if (response.errors[0].error_code === 'ERROR_GENERIC'){
			res.sendFile(`${__dirname}/failure.html`);
		}else if (response.errors[0].error_code === 'ERROR_CONTACT_EXISTS'){
			res.sendFile(`${__dirname}/contact.html`);
	  	}
	};

	run().then(() => {
	    console.log('Status OK')
	}).catch((err) => {
	    console.log(`Erro: ${err}`)
	})
});