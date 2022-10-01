<?php
var data = req.method == 'GET' ? req.query : req.body,
	add_proto = url => (!/^(?:f|ht)tps?\:\/\//.test(url)) ? 'https://' + url : url,
	is_url = str => (/^https?:\/{2}|\S+\./g).test(str);

if(!data.url)echo('Missing `url` param');
else{
	var url = req.method == 'GET' ? atob(data.url) : data.url;

	url = is_url(url) ? add_proto(url) : 'https://www.google.com/search?q=' + encodeURIComponent(url);

	switch(req.query.route){
		case'vi':
			
			res.cookies.gateway = { value: 'vi' };
			html.redirect('/' + encodeURI(url));
			
			break;
		case'ap':
			
			res.cookies.gateway = { value: 'ap' };
			html.redirect('/session?url=' + encodeURIComponent(btoa(url)));
			
			break;
		default:
			
			res.cookies.gateway = { value: 'sp', samesite: 'lax' };
			html.redirect('/prox?' + (data.type ? 'type=' + data.type + '&' : '') + 'url=' + encodeURIComponent(btoa(url)));
		
			break;
	}
}
?>