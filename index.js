'use strict';
var fs = require('fs'),
	path = require('path'),
	nodehttp = require('sys-nodehttp'),
	server = new nodehttp.server({
		address: '0.0.0.0',
		port: 9000,
		execute: [ '.php' ],
		index: [ 'index.php', 'index.html' ],
		log: true,
	}),
	// rewriter = require('../proxy'),
	// rw = new rewriter({ server: server, prefix: '/service' }),
	login = 'booster:password',
	reserved = ['booster link hostname 1', 'booster link hostname 2'],
	failed = new Map(),
	img = /(.*?)-(\d+)-(\d+)(\.img)$/,
	static_data = path.join(__dirname, 'public');

server.use(async (req, res, next) => {
	if(failed.has(req.real_ip) && failed.get(req.real_ip) > 10)return res.error(403, 'Your IP has exceeded the maximum attempts (10).');
	
	// res.set('content-security-policy', `default-src 'self' 'unsafe-eval' 'unsafe-inline';`);
	res.set('x-xss-protection', '1; mode=block');
	res.set('x-content-type-options', 'nosniff');
	res.set('x-frame-options', 'sameorigin');
	res.set('referrer-policy', 'no-referrer');
	
	if(!reserved.some(host => req.url.hostname == host || req.url.hostname.endsWith(host)) || req.headers.has('authorization') && Buffer.from(req.headers.get('authorization').substr(6), 'base64').toString('utf8') == login){
		var match = req.url.pathname.match(img);
		
		if(!match)return next();
		
		var file = path.join(static_data, match[1] + match[4]),
			first = parseInt(match[2]),
			last = parseInt(match[3]);
		
		if(isNaN(first) || isNaN(last) || !fs.existsSync(file))return res.error(404);
		
		if(!file.startsWith(static_data))return res.redirect('/');
		
		res.contentType(nodehttp.http.mimes.img);
		
		var size = last - first;
		
		fs.open(file, 'r', (err, fd) => {
			if(err)return console.error(err), res.error(400, err);
			
			fs.read(fd, Buffer.alloc(size), 0, size, first, (err, bytes, buffer) => {
				if(err)return console.error(err), res.error(400, err);
				
				res.send(buffer);
				
				fs.close(fd, () => {});
			});
		});
	}else{
		res.set('www-authenticate', 'basic realm="Authorization required"');
		
		res.error(401);
		
		if(req.headers.has('authorization')){
			failed.set(req.real_ip, (failed.get(req.real_ip) || 0) + 1);
			
			if(failed.get(req.real_ip) > 3)console.log(req.real_ip + ' has ' + failed.get(req.real_ip) + ' failed attempts\n' + req.headers.get('user-agent'));
		}
	}
});

server.use((req, res, next) => {
	res.set('x-xss-protection', '1; mode=block');
	res.set('x-content-type-options', 'nosniff');
	res.set('x-frame-options', 'sameorigin');
	res.set('referrer-policy', 'no-referrer');
	
	next();
});

server.alias('/gateway', '/gateway.php');

server.get('/search', (req, res) => {
	if(!req.query.q)return res.error(400);
	
	nodehttp.fetch('https://duckduckgo.com/ac/?q=' + encodeURIComponent(req.query.q)).then(resp => resp.json()).then(data => res.json(data.map(data => data.phrase))).catch(err => res.error(500, err));
});

server.use(nodehttp.static(static_data));
// server.use('/prox', (req, res) => res.redirect(rw.url(rewriter.codec.base64.decode(req.query.url), { origin: req.url.href, type: req.query.type })));