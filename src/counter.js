const button = document.getElementById('soundBtn');
const clickSound = new Audio('/pop.mp3');

button.addEventListener('click', () => {
  clickSound.currentTime = 0; // rewind if already playing
  clickSound.play();
});
