// Created by 张强
(function () {
	var webglEl = document.getElementById('webgl');

	if (!Detector.webgl) {
		Detector.addGetWebGLMessage(webglEl);
		return;
	}

	var width = window.innerWidth,
		height = window.innerHeight;

	// Earth params
	var radius = 0.5,
		segments = 64,
		rotation = 6;
	var rotationControl = true;
	// var zeroVec3 = new THREE.Vector3(0, 0, 0);

	var scene = new THREE.Scene();
	// scene.rotationY = 8
	var group = new THREE.Group();

	scene.add(group)

	var camera = new THREE.PerspectiveCamera(40, width / height, 0.01, 1000);
	camera.position.z = 2;
	camera.lookAt(new THREE.Vector3(0, 0, 0));

	var renderer = new THREE.WebGLRenderer();
	renderer.setSize(width, height);

	group.add(new THREE.AmbientLight(0x333333, 0.5));

	var hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x333333, 1);
	hemisphereLight.position.x = 0;
	hemisphereLight.position.y = 0;
	hemisphereLight.position.z = -200;
	group.add(hemisphereLight);

	var light = new THREE.DirectionalLight(0xffffff, 0.2);
	light.position.set(5, 3, 5);
	scene.add(light);

	// var controls = new THREE.TrackballControls(camera);
	var controls = new THREE.OrbitControls(camera, renderer.domElement);
	// console.log(111, controls)
	controls.autoRotate = false;
	controls.autoRotateSpeed = 0.8;
	controls.enableDamping = true;
	controls.enableZoom = false;

	var loader = new THREE.FontLoader();

	loader.load('fonts/Microsoft YaHei-3970_Regular.json', function (response) {
		var stars = createStars(90, 64);
		scene.add(stars);

		var sphere = createSphere(radius, segments);
		// sphere.rotation.y = rotation;
		group.add(sphere)


		var clouds = createClouds(radius, segments);
		// clouds.rotation.y = rotation;
		group.add(clouds)
		var settings = {
			rotationX: 0,
			rotationY: 0,
			rotationZ: 0
		};
		// createGui(settings);

		//初始化dat.GUI简化面板
		// var gui = {};
		// var datGui = new dat.GUI();

		// var tween;
		var locations = [];
		var texts = [];

		// [{"name":"北京","lng":116.40717,"lat":39.90469,"size":0.01,"color":"0xffff00"},{"name":"广州","lng":113.26436,"lat":23.12908,"size":0.01,"color":"0xffff00"},{"name":"美国","lng":-95.7128906,"lat":37.0902405,"size":0.01,"color":"0xffff00"},{"name":"上海","lng":121.4737,"lat":31.23037,"size":0.01,"color":"0xffff00"}]
		// [{"name":"北京","lng":116.40717,"lat":39.90469,"size":0.01,"color":"0xffff00"}]
		// {"name":"北京","lng":116.40717,"lat":39.90469,"size":0.01,"color":"0xffff00"}

		// 测试数据
		// var locs = [
		// 	{ name: '北京', lng: 116.40717, lat: 39.90469, size: 0.01, color: 0xffff00 },
		// 	{ name: '广州', lng: 113.26436, lat: 23.12908, size: 0.01, color: 0xffff00 },
		// 	{ name: '美国', lng: -95.7128906, lat: 37.0902405, size: 0.01, color: 0xffff00 },
		// ]

		// for (var i in locs) {
		// 	// var loc = { name: '北京', lng: 116.40717, lat: 39.90469, size: 0.01, color: 0xffff00 }
		// 	var location = createLocation(locs[i])
		// 	scene.add(location);
		// 	locations.push(location);
		// 	// initTween(location)
		// 	var text = createText(response, locs[i])
		// 	scene.add(text);
		// }

		var hostname = '101.200.39.236', //'192.168.1.2',
			port = 8083,
			clientId = 'clien-threejs',
			timeout = 5,
			keepAlive = 10000,
			cleanSession = false,
			ssl = false,
			userName = 'admin',
			password = 'public',
			topic = 'threejs/#';

		var client = new Paho.MQTT.Client(hostname, port, clientId);
		client.onMessageArrived = function (message) {
			var topic = message.destinationName;
			var payload = message.payloadString;
			var data = null;
			try {
				data = JSON.parse(payload)
			} catch (err) {
				console.error(err)
			}

			if (!data) {
				return
			}
			switch (topic) {
				case 'threejs/locs':
					var locs = data;
					controls.reset();
					for (var i in locations) {
						group.remove(locations[i]);
					}
					for (var i in texts) {
						group.remove(texts[i]);
					}
					for (var i in locs) {
						var location = createLocation(locs[i])
						locations.push(location);
						group.add(location);
						var text = createText(response, locs[i])
						texts.push(text);
						group.add(text);
					}
					break;
				case 'threejs/xz':
					var loc = data;
					rotationControl = false
					// controls.autoRotate = false;
					controls.reset();
					var lg = (180 - loc.lng) * Math.PI / 180, lt = (loc.lat) * Math.PI / 180;
					// console.log(lg, lt)
					// controls.rotation.y = lg;
					// controls.rotation.x = lt;

					// var l = lglt2xyz(180 - loc.lng, loc.lat, radius)
					// var destCity = scene.getObjectByName('city_' + loc.name);
					// console.log(2, destCity)
					// console.log(11, calCamToCityAngle(destCity))
					// controls.reset();
					settings.rotationX = lt
					settings.rotationY = lg + 1.55
					// controls.lookAt(l.x, l.y, l.z);
					// rotateToCity(loc.name)
					break;
				case 'threejs/qx':
					// controls.autoRotate = true;
					controls.reset();
					rotationControl = true;
					settings = {
						rotationX: 0,
						rotationY: 0,
						rotationZ: 0
					};
					break;
			}
		};
		//建立客户端实例  
		var options = {
			invocationContext: {
				host: hostname,
				port: port,
				path: client.path,
				clientId: clientId
			},
			timeout: timeout,
			keepAliveInterval: keepAlive,
			cleanSession: cleanSession,
			useSSL: ssl,
			userName: userName,
			password: password,
			onSuccess: function () {
				client.subscribe(topic);
			},
			onFailure: function (e) {
				console.error(e);
			}
		};
		client.connect(options);


		webglEl.appendChild(renderer.domElement);

		render();
		// var tweenRot = new TWEEN.Tween();
		function render() {
			TWEEN.update();
			controls.update();
			// group.rotation.set(settings.rotationX, settings.rotationY, settings.rotationZ);
			if (rotationControl) {
				group.rotation.y += 0.01;
			} else {
				group.rotation.set(settings.rotationX, settings.rotationY, settings.rotationZ);
			}
			requestAnimationFrame(render);
			renderer.render(scene, camera);
		}

		//定位到城市
		function rotateToCity(cityName) {

			var destCity = group.getObjectByName('city_' + cityName);
			if (!destCity) {
				console.log("目标城市不存在，请检查！");
				return
			}

			var rotAxis = calCamToCityRotAxis(destCity);
			var rotAngleOffset = 0;

			var coords = { rotAngle: 0 };
			var tweenRot = new TWEEN.Tween(coords)
				.to({ rotAngle: calCamToCityAngle(destCity) }, 2000)
				// .onUpdate(function () {
				// 	rotateAroundWorldAxis(camera, rotAxis, this.rotAngle - rotAngleOffset);
				// 	rotAngleOffset = this.rotAngle;
				// 	camera.lookAt(zeroVec3);
				// })
				//.easing(TWEEN.Easing.Cubic.Out)
				.easing(TWEEN.Easing.Sinusoidal.InOut)
				.start();
			//    allTweens.push(tweenRot);

			// console.log(123, tweenRot)
		}

		function calCamToCityRotAxis(destCity) {
			var destCityPosition = new THREE.Vector3(0 - destCity.position.x, 0 - destCity.position.y, 0 - destCity.position.z);
			var cameraPosition = new THREE.Vector3(0 - camera.position.x, 0 - camera.position.y, 0 - camera.position.z);
			var rotAxis = cameraPosition.cross(destCityPosition);
			return rotAxis;
		}

		function calCamToCityAngle(destCity) {

			var destCityPosition = new THREE.Vector3(0 - destCity.position.x, 0 - destCity.position.y, 0 - destCity.position.z);
			var cameraPosition = new THREE.Vector3(0 - camera.position.x, 0 - camera.position.y, 0 - camera.position.z);
			var angleCamToDst;
			if (destCityPosition.length() != 0 && cameraPosition.length() != 0) {
				angleCamToDst = Math.acos(destCityPosition.dot(cameraPosition) / (destCityPosition.length() * cameraPosition.length()));
			}
			return angleCamToDst;
		}

	})

	function createSphere(radius, segments) {
		return new THREE.Mesh(
			new THREE.SphereGeometry(radius, segments, segments),
			new THREE.MeshPhongMaterial({
				map: THREE.ImageUtils.loadTexture('images/2_no_clouds_4k.jpg'),
				bumpMap: THREE.ImageUtils.loadTexture('images/elev_bump_4k.jpg'),
				bumpScale: 0.005,
				specularMap: THREE.ImageUtils.loadTexture('images/water_4k.png'),
				specular: new THREE.Color('grey')
			})
		);
	}

	function createClouds(radius, segments) {
		return new THREE.Mesh(
			new THREE.SphereGeometry(radius + 0.003, segments, segments),
			new THREE.MeshPhongMaterial({
				map: THREE.ImageUtils.loadTexture('images/fair_clouds_4k.png'),
				transparent: true
			})
		);
	}

	function createStars(radius, segments) {
		return new THREE.Mesh(
			new THREE.SphereGeometry(radius, segments, segments),
			new THREE.MeshBasicMaterial({
				map: THREE.ImageUtils.loadTexture('images/galaxy_starfield.png'),
				side: THREE.BackSide
			})
		);
	}

	// 创建位置 信息loc : {name:'bj',lng:116.40717,lat:39.90469,size:0.01,color:'0xffff00'}
	function createLocation(loc) {
		var geometry = new THREE.CircleGeometry(loc.size, 64);

		var material = new THREE.MeshBasicMaterial({ color: new THREE.Color(loc.color, 1.0) });
		var circle = new THREE.Mesh(geometry, material);
		var g = lglt2xyz(loc.lng, loc.lat, radius);
		var g1 = lglt2xyz(loc.lng, loc.lat, radius * 1.1);
		circle.position.set(g.x, g.y, g.z)
		circle.lookAt(new THREE.Vector3(g1.x, g1.y, g1.z));
		circle.name = 'city_' + loc.name

		// initTween(circle)
		return circle
	}

	function createText(font, loc) {
		var textGeometry = new THREE.TextGeometry(loc.name, {
			"font": font,
			"size": 0.008,
			"height": 0.001,
			"bevelEnabled": false,
			"bevelThickness": 5,
			"bevelSize": 8
		})

		var text = new THREE.Mesh(textGeometry, new THREE.MultiMaterial([
			new THREE.MeshPhongMaterial({ color: new THREE.Color(loc.color, 1.0), flatShading: true }), // front
			new THREE.MeshPhongMaterial({ color: new THREE.Color(loc.color, 1.0) }) // side
		]))

		textGeometry.computeBoundingBox();
		var g = lglt2xyz(loc.lng + ((loc.size * 3 * 180) / Math.PI), loc.lat - 0.2, radius);
		var g1 = lglt2xyz(loc.lng + ((loc.size * 3 * 180) / Math.PI), loc.lat - 0.2, radius * 1.1);
		text.position.set(g.x, g.y, g.z)
		text.lookAt(new THREE.Vector3(g1.x, g1.y, g1.z));
		text.name = 'city_text_' + loc.name
		return text;
	}

	//添加tween动画
	function initTween(mesh) {
		// var tween;
		// var coords = { rotAngle: 0 };
		// tween = new TWEEN.Tween(coords).to(coords, 5000);
		// tween.easing(TWEEN.Easing.Sinusoidal.InOut);
		// tween.start();
		new TWEEN.Tween(mesh.position)
			.to({ x: 0 }, 3000).repeat(Infinity).start();
	}

	//初始化dat.GUI简化试验流程

	function createGui(settings) {
		//声明一个保存需求修改的相关数据的对象

		//初始化gui
		var gui = new dat.GUI();

		// var position = gui.addFolder("position");
		// position.add(settings, "positionX", -30, 30).listen();
		// position.add(settings, "positionY", -30, 30).listen();
		// position.add(settings, "positionZ", -30, 30).listen();
		// var scale = gui.addFolder("scale");
		// scale.add(settings, "scaleX", 0.01, 5);
		// scale.add(settings, "scaleY", 0.01, 5);
		// scale.add(settings, "scaleZ", 0.01, 5);
		var rotation = gui.addFolder("rotation");
		rotation.add(settings, "rotationX", -2 * Math.PI, 2 * Math.PI);
		rotation.add(settings, "rotationY", -2 * Math.PI, 2 * Math.PI);
		rotation.add(settings, "rotationZ", -2 * Math.PI, 2 * Math.PI);
		// var translate = gui.addFolder("translate");
		// translate.add(settings, "translateX", -5, 5);
		// translate.add(settings, "translateY", -5, 5);
		// translate.add(settings, "translateZ", -5, 5);
		// translate.add(settings, "translate");
		// gui.add(settings, "visible");
	}

	/**
	 * 经纬度转xyz
	 * @param longitude 经度
	 * @param latitude 纬度
	 * @param radius 半径
	 */
	function lglt2xyz(longitude, latitude, radius) {
		//	    var lg = THREE.Math.degToRad(longitude) , lt = THREE.Math.degToRad(latitude);
		var lg = (longitude + 90) * Math.PI / 180, lt = latitude * Math.PI / 180;
		var y = radius * Math.sin(lt);
		var temp = radius * Math.cos(lt);
		var x = temp * Math.sin(lg);
		var z = temp * Math.cos(lg);
		// console.log(x+","+y+","+z);
		return { x: x, y: y, z: z }
	}

	function getScreenPosition(position) {

		var vector = new THREE.Vector3(position.x, position.y, position.z);

		vector.project(camera);
		vector.x = Math.round((vector.x + 1) * width / 2);
		vector.y = Math.round((- vector.y + 1) * height / 2);
		return vector;
	}

})();