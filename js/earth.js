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
		var locs = [
			{ name: '北京', lng: 116.40717, lat: 39.90469, size: 0.01, color: 0xffff00 },
			{ name: '广州', lng: 113.26436, lat: 23.12908, size: 0.01, color: 0xffff00 },
			{ name: '美国', lng: -95.7128906, lat: 37.0902405, size: 0.01, color: 0xffff00 },
		]

		for (var i in locs) {
			// var loc = { name: '北京', lng: 116.40717, lat: 39.90469, size: 0.01, color: 0xffff00 }
			var location = createLocation(locs[i])
			group.add(location);
			locations.push(location);
			// initTween(location)
			var text = createText(response, locs[i])
			group.add(text);
		}

		// 添加圆柱
		group.add(createCylinder({ name: '北京', lng: 116.40717, lat: 39.90469, size: 0.01, color: 0xffff00 }))

		// 添加飞行线
		var l = createLine([{ "name": "北京", "lng": 116.40717, "lat": 39.90469, "size": 0.01, "color": "0xffff00" }, { "name": "广州", "lng": 113.26436, "lat": 23.12908, "size": 0.01, "color": "0xffff00" }])
		group.add(l)

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
					// controls.autoRotate = false;
					var loc = data;
					rotationControl = false
					controls.reset();
					var lg = (180 - loc.lng) * Math.PI / 180, lt = (loc.lat) * Math.PI / 180;
					settings.rotationX = lt
					settings.rotationY = lg + 1.55
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

		// 消息队列,建立客户端实例  
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

		function render() {
			TWEEN.update();
			controls.update();
			if (rotationControl) {
				group.rotation.y += 0.01;
			} else {
				group.rotation.set(settings.rotationX, settings.rotationY, settings.rotationZ);
			}
			requestAnimationFrame(render);
			renderer.render(scene, camera);
		}
	})

	// 创建地球
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

	// 创建云层
	function createClouds(radius, segments) {
		return new THREE.Mesh(
			new THREE.SphereGeometry(radius + 0.003, segments, segments),
			new THREE.MeshPhongMaterial({
				map: THREE.ImageUtils.loadTexture('images/fair_clouds_4k.png'),
				transparent: true
			})
		);
	}

	// 创建星空背景
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
		var geometry = new THREE.CircleGeometry(loc.size, segments);
		var material = new THREE.MeshBasicMaterial({ color: new THREE.Color(loc.color, 1.0) });
		var circle = new THREE.Mesh(geometry, material);
		var g = lglt2xyz(loc.lng, loc.lat, radius);
		var g1 = lglt2xyz(loc.lng, loc.lat, radius * 1.1);
		circle.position.set(g.x, g.y, g.z)
		circle.lookAt(new THREE.Vector3(g1.x, g1.y, g1.z));
		circle.name = 'loc_' + loc.name
		return circle
	}

	// 创建位置标签
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
		text.name = 'loc_lable_' + loc.name
		return text;
	}

	// 圆柱体
	function createCylinder(loc, h) {
		var h = 0.1;
		var c = new THREE.Mesh(
			new THREE.CylinderGeometry(loc.size, loc.size, 0.5, segments, segments),
			new THREE.MeshBasicMaterial({ color: new THREE.Color(loc.color, 1.0) })
		);

		var g = lglt2xyz(loc.lng, loc.lat, radius);
		var g1 = lglt2xyz(loc.lng, loc.lat, radius * 1.1);

		c.geometry.translate(0, h / 2, 0);
		c.position.set(g.x, g.y, g.z);
		c.lookAt(new THREE.Vector3(0, 0, 0));
		c.rotateX(-Math.PI / 2);
		c.name = 'loc_cylinder_' + loc.name;
		return c
	}

	// 创建曲线
	function createLine(trackCoordArr) {
		var trackMaterial = new THREE.LineBasicMaterial({ color: 0xffffff });
		console.log(2, trackCoordArr)
		var tcaLength = trackCoordArr.length;
		if (tcaLength >= 2) {
			var tcaHalfLength = Math.ceil(tcaLength / 2);

			/* 所有点
			for(var j=0; j<tcaHalfLength; j++) {
					var p1 = getPosition(trackCoordArr[j].lng, trackCoordArr[j].lat, j*0.05);
					vertexArr.push(new THREE.Vector3(p1.x, p1.y, p1.z));    
			}
			for(var k=tcaRemainLength; k>0; k--) {
					var p2 = getPosition(trackCoordArr[tcaLength-k].lng, trackCoordArr[tcaLength-k].lat, k*0.05);
					vertexArr.push(new THREE.Vector3(p2.x, p2.y, p2.z));    
			}
			
			var trackCurve = new THREE.CatmullRomCurve3(vertexArr);
			*/

			// 三个点
			var p1 = lglt2xyz(trackCoordArr[0].lng, trackCoordArr[0].lat, radius),
				p2 = lglt2xyz(trackCoordArr[1].lng - (trackCoordArr[1].lng - trackCoordArr[0].lng) / 2, trackCoordArr[1].lat - (trackCoordArr[1].lat - trackCoordArr[0].lat) / 2, radius * 1.02),
				p3 = lglt2xyz(trackCoordArr[1].lng, trackCoordArr[1].lat, radius);

			var trackCurve = new THREE.SplineCurve3([
				new THREE.Vector3(p1.x, p1.y, p1.z),
				new THREE.Vector3(p2.x, p2.y, p2.z),
				new THREE.Vector3(p3.x, p3.y, p3.z),
			]);

			var trackGeometry = new THREE.Geometry(),
				verticesArr = trackCurve.getPoints(100);

			trackGeometry.vertices = verticesArr;

			var trackLine = new THREE.Line(trackGeometry, trackMaterial);
			addLightPoint(p1, 100, verticesArr);

			return trackLine;
			// 动画点
		}
	}

	function addLightPoint(pos, coordsNum, verArr) {
		// 点动画
		var pointGeometry = new THREE.SphereGeometry(radius * 0.01, segments, segments);
		var pointMaterial = new THREE.MeshBasicMaterial({ color: 0x40E0D0 });
		var pointMesh = new THREE.Mesh(pointGeometry, pointMaterial);
		pointMesh.position.set(pos.x, pos.y, pos.z);
		group.add(pointMesh);

		var index = 0;
		function pointAnimate() {
			index++;
			if (index > coordsNum) {
				index = 0;
			}
			pointMesh.position.set(verArr[index].x, verArr[index].y, verArr[index].z);
			// requestAnimationFrame(pointAnimate);

			window.setTimeout(pointAnimate, 1000 / 60);//定义每秒执行60次动画
		}
		pointAnimate();

		/*var curveGeometry = new THREE.Geometry(); 
		var curveData = new THREE.CatmullRomCurve3(verArr.slice(0, 10));  
		curveGeometry.vertices = curveData.getPoints(10);

		var curveMaterial = new THREE.LineBasicMaterial({color: 0x40E0D0});
		var curveLine = new THREE.Line(curveGeometry, curveMaterial);
		group.add(curveLine);

		var index = 0;
		function lineAnimate() {
				index++;
				if(index>coordsNum-10) {
						index = 0;
				}
				var offsetData = verArr.slice(index, 10+index);
				if(offsetData.length > 0) {
						curveData = new THREE.CatmullRomCurve3(offsetData);  
							 curveLine.geometry.vertices = curveData.getPoints(10);
						curveLine.geometry.verticesNeedUpdate = true;
				}
				requestAnimationFrame(lineAnimate);
		}
		lineAnimate();*/
	}

	//初始化dat.GUI简化试验流程
	function createGui(settings) {
		//声明一个保存需求修改的相关数据的对象

		//初始化gui
		var gui = new dat.GUI();
		var rotation = gui.addFolder("rotation");
		rotation.add(settings, "rotationX", -2 * Math.PI, 2 * Math.PI);
		rotation.add(settings, "rotationY", -2 * Math.PI, 2 * Math.PI);
		rotation.add(settings, "rotationZ", -2 * Math.PI, 2 * Math.PI);
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

	// 获取position
	function getPosition(lng, lat, alt) {
		var phi = (90 - lat) * (Math.PI / 180),
			theta = (lng + 180) * (Math.PI / 180),
			radius = alt + 200,
			x = -(radius * Math.sin(phi) * Math.cos(theta)),
			z = (radius * Math.sin(phi) * Math.sin(theta)),
			y = (radius * Math.cos(phi));
		return { x: x, y: y, z: z };
	}

	function getScreenPosition(position) {
		var vector = new THREE.Vector3(position.x, position.y, position.z);
		vector.project(camera);
		vector.x = Math.round((vector.x + 1) * width / 2);
		vector.y = Math.round((- vector.y + 1) * height / 2);
		return vector;
	}
})();