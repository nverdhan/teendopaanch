

var socket = io('http://localhost:3000');

socket.on('message', function(data){
	console.log(data);
	alert(data);
	socket.emit('reply', { reply : 'the state goes here'});
});
