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
      vueCanvas: null,
    };
  },
  methods: {
    showResult() {
      const vm = this;
      vm.vueCanvas.strokeStyle = 'red';
      vm.vueCanvas.lineWidth = 3;
      vm.vueCanvas.strokeRect(vm.toLeftPixel, vm.toTopPixel, vm.rectWidthPixel, vm.rectHeightPixel);

      vm.vueCanvas.font = `900 ${vm.fontSize + 1}px Arial`;
      vm.vueCanvas.fillStyle = 'red';
      vm.vueCanvas.shadowColor = 'white';
      vm.vueCanvas.shadowBlur = vm.fontSize / 2;

      const textInitY = vm.toTopPixel + vm.rectHeightPixel + vm.fontSize * 1.2;
      const textInitX = vm.toLeftPixel - vm.leftShiftPixel;
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
