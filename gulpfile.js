const {src, task, dest, watch, series} = require('gulp'),
	shell = require('gulp-shell'),
	concat = require('gulp-concat'),
	uglify = require('gulp-uglify'),
	rev = require('gulp-rev'),
	cleanCSS = require('gulp-clean-css'),
	imagemin = require('gulp-imagemin');

const TMP = './.tmp';

let clean = shell.task([`rm -rf ${TMP}`]),
	models = (cb) => {
		['bo', 'checkin', 'checkout', 'me', 'admin', 'api'].forEach((e) => {
			src(`../gitlab/${e}/**/*.model.js`)
				.pipe(flatten())
				.pipe(dest(`${TMP}/${e}/`));
		});

		cb();
	},
	img = (cb) => {
		src('../github/cdn/img/**')
			.pipe(
				imagemin(
					[
						imagemin.mozjpeg({
							quality: 80,
							progressive: true
						}),
						imagemin.optipng({
							optimizationLevel: 5
						})
					],
					{
						verbose: true
					}
				)
			)
			.pipe(dest('../github/cdn/img/'))
			.on('end', cb);
	},
	min = (cb) => {
		src('./node_modules/fastclick/lib/fastclick.js').pipe(uglify()).pipe(dest('./.tmp/')).on('end', cb);
	},
	checkin = (() => {
		let rm = shell.task([`rm -f ./fancy-checkin/js/bundle*.js`, `rm -f ./fancy-checkin/css/bundle*.css`]),
			js = (cb) => {
				let files = ['jquery', 'vue', 'mask', 'slick', 'lazysizes', 'fastclick', 'qrcode', 'signature', 'sweetalert2', 'app'].map((e) => {
					return `./fancy-checkin/js/${e}.js`;
				});
				src(files).pipe(concat('bundled.js')).pipe(rev()).pipe(uglify()).pipe(dest('./fancy-checkin/js/')).on('end', cb);
			},
			css = (cb) => {
				let files = ['animate', 'et-lineicons', 'themify-icons', 'bootstrap', 'spinkit', 'app', 'slick', 'sweetalert2', 'keyboard', 'style'].map((e) => {
					return `./fancy-checkin/css/${e}.css`;
				});
				src(files).pipe(concat('bundled.css')).pipe(rev()).pipe(cleanCSS()).pipe(dest('./fancy-checkin/css/')).on('end', cb);
			};
		return series(rm, js, css);
	})();

exports.checkin = checkin;
