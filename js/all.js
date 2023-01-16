const vm = Vue.createApp({
  data() {
    return {
      XCoord: 0,
      YCoord: 0,
      pathCoords: [],
      recordMode: false,
      // 先寫死，待研究怎麼取檔比較好
      imageList: [
        { imagePoint: '照片範例', imageFileName: '20221230_CamImg' },
        { imagePoint: '黃範例', imageFileName: '20230116_YellowImg' },
        { imagePoint: '藍範例', imageFileName: '20230116_BlueImg' },
        { imagePoint: '綠範例', imageFileName: '20230116_GreenImg' },
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
      // When recordMode is true, starting record x, y
      if (vm.recordMode) {
        let x = vm.XCoord;
        let y = vm.YCoord;
        vm.pathCoords.push({ x, y });
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
        const image = new Image();
        console.log(image);
        image.onload = () => {
          vm.vueCanvas.drawImage(image, 0, 0);
        };
        image.src = `../images/${vm.selectedPoint}.png`;
      } else {
        window.alert('請先選擇圖片才能載入！');
      }
    },
    switchMode() {
      const vm = this;
      // console.log('switch');
      vm.recordMode = !vm.recordMode;
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
    uploadImage(e) {
      // console.log('e: ', e);
      // console.log('e.target.files: ', e.target.files);
      console.log('e.target.files[0]: ', e.target.files[0]);

      const vm = this;
      const image = new Image();

      image.addEventListener('load', function () {
        vm.vueCanvas.drawImage(image, 0, 0);
      });
      image.src = vm.imageUrl;
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
});

// mount
vm.mount('#app');
