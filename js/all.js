const vm = Vue.createApp({
  data() {
    return {
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
      vueCanvas: null,
    };
  },
  methods: {
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
