// $(function () {
// 	$('#loginForm').submit(function (e) {
// 		e.preventDefault();
// 		var username = $('#txtUserName').val(),
// 			password = $('#txtPassword').val();
// 		if (username && password) {
// 			$.ajax({
// 				type: 'POST',
// 				url: '/login',
// 				data: JSON.stringify({
// 					username: username,
// 					password: password,
// 				}),
// 				contentType: 'application/json',
// 				dataType: 'json',
// 			})
// 				.done(function (e) {
// 					if (e.success) {
// 						window.location.assign($('#ref').val());
// 					} else {
// 						$('#loginError').show();
// 					}
// 				})
// 				.fail(function () {
// 					$('#loginError').show();
// 				});
// 		} else {
// 			$('#loginError').show();
// 		}
// 	});
// });
