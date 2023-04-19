const vm = Vue.createApp({
  data() {
    return {
      XCoord: 0,
      YCoord: 0,
      pathCoords: [],
      recordMode: false,
      // 先寫死，待研究怎麼取檔比較好
      imageList: [
        { imagePoint: '照片範例1', imageFileName: 'SamplePicture1' },
        { imagePoint: '照片範例2', imageFileName: 'SamplePicture2' },
        { imagePoint: '照片範例3', imageFileName: 'SamplePicture3' },
        { imagePoint: '照片範例4_夜間', imageFileName: 'SamplePicture4_Night' },
      ],
      fontSize: 16,
      toTopPixel: 10,
      toLeftPixel: 10,
      rectWidthPixel: 100,
      rectHeightPixel: 50,
      textContentVal: 'ROI',
      leftShiftPixel: 0,
      bottomShiftPixel: 0,
      selectedOutlineColor: 'white',
      colors: ['white', 'black'],
      selectedFontWeight: 700,
      rotateDegree: 0,
      fontOptions: [
        { weightName: 'Light', weightNum: 300 },
        { weightName: 'Regular', weightNum: 400 },
        { weightName: 'Bold', weightNum: 700 },
        { weightName: 'Black', weightNum: 900 },
      ],
      // imageUrl: '../images/ExampleImage.png',
      selectedPoint: 'default',
      vueCanvas: null,
    };
  },
  methods: {
    getCoords(event) {
      const canvas = this.$refs.canvas;

      // console.log('moved!');

      // canvas 元素到網頁頂端的距離, 56
      // console.log('canvas.offsetTop', canvas.offsetTop);
      // canvas 元素的 borderTopWidth, 1
      // console.log('canvas.clientTop', canvas.clientTop);
      // canvas 元素到網頁左邊的距離, 214
      // console.log('canvas.offsetLeft', canvas.offsetLeft);
      // canvas 元素的 borderLeftWidth, 1
      // console.log('canvas.clientLeft', canvas.clientLeft);

      // 取得滑鼠移動事件
      // console.log('event', event);

      // 到目前瀏覽器顯示區域的頂端
      // console.log('event clientY: ', event.clientY);
      // 到頁面頂端
      // console.log('event pageY: ', event.pageY);
      // 到目前螢幕頂端(超出瀏覽器)
      // console.log('event screenY: ', event.screenY);

      const vm = this;
      vm.XCoord = event.pageX - canvas.offsetLeft;
      vm.YCoord = event.pageY - canvas.offsetTop;
    },
    recordCoords(event) {
      const vm = this;

      // 限制點位記錄數
      if (vm.pathCoords.length >= 4) {
        window.alert('繪製點位不可超出 4 組！');
        return;
      }

      // When recordMode is true, start to record x, y
      if (vm.recordMode) {
        let x = vm.XCoord;
        let y = vm.YCoord;
        vm.pathCoords.push({ x, y });
        vm.drawConnection();
      }
    },
    changeSelect(e) {
      // console.log('e.target.value: ', e.target.value);
      const vm = this;
      vm.selectedPoint = e.target.value;
      // vm.selectedPoint = ;
    },
    importImage() {
      // axios.get('https://randomuser.me/api/').then(function (response) {
      //   console.log('response ', response);
      //   console.log('response.data.results[0] ', response.data.results[0]);
      // });

      // axios.get('http://localhost:3000/GetTaipeiDistrict').then(function (response) {
      //   console.log('localhost ', response);
      // });

      const vm = this;

      if (vm.selectedPoint !== 'default') {
        let image = new Image();
        // fix the issue of tainted canvases may not be exported.
        image.crossOrigin = 'Anonymous';
        // an object
        console.log(image);
        // console.dir(image);
        image.onload = () => {
          vm.vueCanvas.drawImage(image, 0, 0);
        };
        // online: https://eugenachtzehn.github.io/canvasToPNG/images/20221230_CamImg.png
        // local: ../images/${vm.selectedPoint}.png
        image.src = `https://eugenachtzehn.github.io/canvasToPNG/images/${vm.selectedPoint}.jpg`;
      } else {
        window.alert('請先選擇圖片才能載入！');
      }
    },
    switchMode() {
      const vm = this;
      // console.log('switch');
      vm.recordMode = !vm.recordMode;
    },
    // 僅畫出兩次點擊間的連線
    drawConnection() {
      const vm = this;
      vm.vueCanvas.beginPath();
      let arrayLength = vm.pathCoords.length;
      vm.vueCanvas.moveTo(vm.pathCoords[arrayLength - 1]?.x, vm.pathCoords[arrayLength - 1]?.y);
      vm.vueCanvas.lineTo(vm.pathCoords[arrayLength - 2]?.x, vm.pathCoords[arrayLength - 2]?.y);
      vm.vueCanvas.closePath();
      vm.vueCanvas.strokeStyle = 'blue';
      vm.vueCanvas.lineWidth = 1;
      vm.vueCanvas.stroke();
    },
    drawPath() {
      // console.log('init!');
      const vm = this;
      // 超過 3 組才能畫框
      if (vm.pathCoords.length >= 3) {
        vm.vueCanvas.beginPath();
        vm.vueCanvas.moveTo(vm.pathCoords[0].x, vm.pathCoords[0].y);
        for (let i = 1; i < vm.pathCoords.length; i++) {
          vm.vueCanvas.lineTo(vm.pathCoords[i].x, vm.pathCoords[i].y);
        }
        vm.vueCanvas.closePath();
        vm.vueCanvas.strokeStyle = 'red';
        vm.vueCanvas.lineWidth = 3;
        vm.vueCanvas.stroke();
      } else {
        window.alert('點位記錄不足 3 組，不能畫框！');
      }
    },
    postToDatabase() {
      const vm = this;
      if (vm.checkIsFourPoints()) {
        // 排好四點在 pathCoords 中的順序，TL > TR > LR > LL
        const orderedPathCoords = vm.reorderPathCoords(vm.pathCoords);
        const postJson = {
          Smoke: {
            // x, y
            TL: [orderedPathCoords[0].x, orderedPathCoords[0].y],
            TR: [orderedPathCoords[1].x, orderedPathCoords[1].y],
            LL: [orderedPathCoords[2].x, orderedPathCoords[2].y],
            LR: [orderedPathCoords[3].x, orderedPathCoords[3].y],
          },
          // Stable: {
          //   TL: [100, 100],
          //   TR: [200, 100],
          //   LL: [200, 200],
          //   LR: [100, 200],
          // },
        };
        axios
          .post('http://localhost:5050/data.ashx', postJson)
          .then((response) => {
            console.log(response);
          })
          .catch((error) => {
            console.log(error);
          });
      } else {
        window.alert('不足 4 點，新增失敗');
        return;
      }
    },
    checkIsFourPoints() {
      const vm = this;
      if (vm.pathCoords.length === 4) {
        return true;
      } else {
        return false;
      }
    },
    reorderPathCoords(coordsArray) {
      let testArray1 = [
        { x: 0, y: 2 },
        { x: 2, y: 1 },
        { x: 3, y: 3 },
        { x: 2, y: 6 },
      ];
      // reversed testArray1
      let testArray2 = [
        { x: 2, y: 6 },
        { x: 3, y: 3 },
        { x: 2, y: 1 },
        { x: 0, y: 2 },
      ];
      let testArray3 = [
        { x: 2, y: 1 },
        { x: 5, y: 1 },
        { x: 3, y: 2 },
        { x: 0, y: 2 },
      ];
      let testArray4 = [
        { x: 2, y: 1 },
        { x: 0, y: 4 },
        { x: 5, y: 4 },
        { x: 1, y: 3 },
      ];
      // exclude invalid array
      if (coordsArray.length < 4) {
        window.alert('array invalid!');
        return;
      }
      let xTotal = 0;
      let yTotal = 0;
      coordsArray.forEach((item) => {
        xTotal += item.x;
        yTotal += item.y;
      });
      let xCenter = xTotal / 4;
      let yCenter = yTotal / 4;
      // console.log('x center: ', xCenter);
      // console.log('y center: ', yCenter);
      // coordsArray.forEach((item, index) => {
      //   console.log(Math.atan2(item.y - yCenter, item.x - xCenter), index);
      // });
      // 左上和左下
      coordsArray.sort((a, b) => {
        return Math.atan2(a.y - yCenter, a.x - xCenter) - Math.atan2(b.y - yCenter, b.x - xCenter);
      });
      return coordsArray;
    },
    uploadImage(e) {
      const vm = this;
      const canvas = this.$refs.canvas;
      // console.log('e: ', e);
      // console.log('e.target.files: ', e.target.files);
      console.log('e.target.files[0]: ', e.target.files[0]);
      const imageFile = e.target.files[0];

      let reader = new FileReader();
      reader.readAsDataURL(imageFile);
      reader.onloadend = (readerEvent) => {
        const image = new Image(); // create image object
        image.src = readerEvent.target.result; // assign converted image to image object
        image.onload = (imageEvent) => {
          console.log('imageEvent', imageEvent);
          console.dir('image', image);
          canvas.width = image.width;
          canvas.height = image.height;
          vm.vueCanvas.drawImage(image, 0, 0);
          let imageData = canvas.toDataURL('image/jpeg', 0.8);
        };
      };

      // image.addEventListener('load', function () {
      //   vm.vueCanvas.drawImage(image, 0, 0);
      // });
      // image.src = vm.imageUrl;
    },
    showResult() {
      const vm = this;
      vm.vueCanvas.strokeStyle = 'red';
      vm.vueCanvas.lineWidth = 3;

      // 因 rotate 是以左上角為圓心旋轉，所以用 translate() 平移
      vm.vueCanvas.translate(vm.toLeftPixel, vm.toTopPixel);
      vm.vueCanvas.rotate((vm.rotateDegree * Math.PI) / 180);
      vm.vueCanvas.strokeRect(0, 0, vm.rectWidthPixel, vm.rectHeightPixel);

      // 畫完框，重設變形量，讓字體不旋轉
      vm.vueCanvas.resetTransform();

      vm.vueCanvas.font = `${vm.selectedFontWeight} ${vm.fontSize}px Arial`;
      vm.vueCanvas.fillStyle = 'red';

      // 白色光暈效果，棄用
      // vm.vueCanvas.shadowColor = 'white';
      // vm.vueCanvas.shadowBlur = vm.fontSize / 2;

      const textInitY = vm.toTopPixel + vm.rectHeightPixel + vm.bottomShiftPixel + 16;
      const textInitX = vm.toLeftPixel - vm.leftShiftPixel;
      console.log('initX:', textInitX, 'initY:', textInitY);

      // 白色框線效果
      vm.vueCanvas.strokeStyle = vm.selectedOutlineColor;
      vm.vueCanvas.lineWidth = 1;

      vm.vueCanvas.strokeText(vm.textContentVal, textInitX, textInitY);
      vm.vueCanvas.fillText(vm.textContentVal, textInitX, textInitY);
    },
    saveResult() {
      const vm = this;
      const canvas = this.$refs.canvas;
      canvas.toBlob((blob) => {
        // 產生時間戳記
        const timestamp = Date.now().toString();
        // 建立一個 <a></a>
        const a = document.createElement('a');
        document.body.append(a);
        a.download = `${vm.textContentVal}-${timestamp}.png`;
        a.href = URL.createObjectURL(blob);
        a.click();
        a.remove();
      });
    },
    clearCanvas() {
      const vm = this;
      // 清空白色光暈
      vm.vueCanvas.shadowColor = null;
      vm.vueCanvas.shadowBlur = null;
      vm.vueCanvas.clearRect(0, 0, canvas.width, canvas.height);
    },
    clearCanvasAndCoords() {
      const vm = this;
      vm.clearCanvas();
      vm.pathCoords = [];
    },
  },
  mounted() {
    // vueCanvas 是存入 2D 畫布的 context 資訊
    // this.$refs.canvas 才是 canvas 的 dom 本體
    const canvas = this.$refs.canvas.getContext('2d');
    this.vueCanvas = canvas;
  },
  created() {},
});

// mount
vm.mount('#app');
