module.exports = function(grunt) {
	grunt.initConfig({
		pkg: grunt.file.readJSON('package.json'),
		uglify: {
			options: {
				banner: '/*! <%= pkg.name %> <%= grunt.template.today("yyyy-mm-dd") %> */\n'
			},
			build: {
				src: 'build/<%= pkg.name %>.js',
				dest: 'build/<%= pkg.name %>.min.js'
			}
		},
		sass: {
	        options: {
	            style: 'compressed'
	        },
	        build: {
	            files: {
	                'build/minesweeper.css': 'src/scss/minesweeper.scss'
	            }
	        }
	    },
	    copy: {
	    	html: {
	    		files: [
	    			{
	    				src: ['src/html/*.html'],
	    				dest: 'build/',
	    				flatten: true,
	    				expand: true,
	    			}
	    		]
	    	},
	    	js: {
	    		files: [
	    			{
	    				src: ['src/js/*.js'],
	    				dest: 'build/',
	    				flatten: true,
	    				expand: true
	    			}
	    		]
	    	}
	    },
	    clean: {
	    	build: {
	    		files: [{
	    			dot: true,
	    			src: [
	    				'build/*'
	    			]
	    		}]
	    	}
	    },
	    htmlmin: {
	    	server: {
	    		options: {
		    		removeComments: true,
        			collapseWhitespace: true	
		    	},
		    	files: {
		    		'build/index.html': 'build/index.html'
		    	}
	    	}
	    },
	    watch: {
	    	options: {
      			livereload: true,
    		},
	    	scripts: {
	    		files: ['src/js/*.js'],
	    		tasks: ['copy:js', 'uglify']
	    	},
	    	css: {
	    		files: ['src/scss/*.scss'],
	    		tasks: ['sass']
	    	},
	    	html: {
	    		files: ['src/html/*.html'],
	    		tasks: ['copy:html', 'htmlmin']
	    	}
	    },
	    connect: {
	    	server: {
	    		options: {
		    		port: 9000,
			    	hostname: '0.0.0.0',
			    	base: 'build',
			    	livereload: true,
			    	open: true
		    	}
	    	}
	    }
	});

	grunt.loadNpmTasks('grunt-contrib-uglify');
	grunt.loadNpmTasks('grunt-contrib-sass');
	grunt.loadNpmTasks('grunt-contrib-watch');
	grunt.loadNpmTasks('grunt-contrib-connect');
	grunt.loadNpmTasks('grunt-contrib-copy');
	grunt.loadNpmTasks('grunt-contrib-clean');
	grunt.loadNpmTasks('grunt-contrib-htmlmin');

	grunt.registerTask('default', [
		'clean:build', 
		'sass',
		'copy',
		'uglify'
	]);
	
	grunt.registerTask('dev', [
		'clean:build', 
		'sass',
		'copy',
		'htmlmin:server',
		'connect:server', 
		'watch'
	]);
}