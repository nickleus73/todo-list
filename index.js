var fs = require('fs');
var readline = require('readline');

var getLineCount = function (file, cb) {
	var count = 1;

	fs.createReadStream(file)
		.on('data', function (chunk) {
			for (var i = 0; i < chunk.length; i++)
				if (chunk[i] == 10) count++;
		})
		.on('end', function () {
			cb(null, count);
		})
		.once('error', cb);
};

var updateTags = function (file, cb) {
	var data = fs.readFileSync(file).toString().split(/\r?\n/);
	var n = data.length;
	var new_data = []
	var count = 1;
	var i = 1;
	var patt = /(#[0-9]+)/i;

	data.forEach(function (line) {
		if(line.trim() !== '') {
			new_data.push(line.replace(patt, '#' + i).trim());
			i++;
		}

		if (count++ >= n) {
			cb(new_data.join('\r\n'));
		}
	});
};

var addTodo = function (file_exist, msg) {
	if(typeof msg !== 'undefined' && msg !== null && msg !== '') {
		if (file_exist) {
			fs.readFile(process.cwd() + '/.todo-list', function (err, data) {
				if (err) throw err;
				getLineCount(process.cwd() + '/.todo-list', function (e, result) {
					msg = '\r\n#' + (result + 1) + ' - ' + msg;

					fs.writeFile(process.cwd() + '/.todo-list', data + msg, function (err) {
						if (err) throw err;
						console.log('Todo\'s saved!');
					});
				});
			});

			return;
		}

		msg = '#1 - ' + msg;

		fs.writeFile(process.cwd() + '/.todo-list', msg, function (err) {
			if (err) throw err;
			console.log('Todo\'s saved!');
		});
	}
};

var readTodo = function (file_exist) {
	fs.readFile(process.cwd() + '/.todo-list', 'utf8', function (err, data) {
		if (err) throw err;
		console.log(data);
	});
};

var deleteTodo = function (file_exist, index) {
	if (file_exist) {
		fs.readFile(process.cwd() + '/.todo-list', 'utf8', function (err, data) {
			if (err) throw err;

			var patt = new RegExp("(#[" + index + "]+|[#" + index + "]) - (.*)[\r\n]?", 'i');

			data = data.replace(patt, '').trim();

			fs.writeFile(process.cwd() + '/.todo-list', data, function (err) {
				if (err) throw err;

				updateTags(process.cwd() + '/.todo-list', function (result) {
					fs.writeFile(process.cwd() + '/.todo-list', result, function (err) {
						if (err) throw err;
						console.log('Todo\'s updated!');
					});
				});
			});

		});
	}
}

var action = function (key, option) {
	switch (key) {
	case '-r':
		fs.exists(process.cwd() + '/.todo-list', function (exists) {
			readTodo(exists);
		});
		break;
	case '-t':
		fs.exists(process.cwd() + '/.todo-list', function (exists) {
			addTodo(exists, option);
		});
		break;
	case '-d':
		fs.exists(process.cwd() + '/.todo-list', function (exists) {
			deleteTodo(exists, option);
		});
		break;
	}
}

action(process.argv[2], (typeof process.argv[3] !== 'undefined') ? process.argv[3] : null);
