const wordList = [
    { word: "rainbow", hint: "Seven colors in the sky" },
    { word: "guitar", hint: "A musical instrument with strings" },
    { word: "oxygen", hint: "A gas essential for breathing" },
    { word: "mountain", hint: "A large natural elevation of the earth's surface" },
    { word: "painting", hint: "An art form using colors on a canvas" },
    { word: "computer", hint: "An electronic device for processing data" }
];



const sidebarToggleBtns = document.querySelectorAll(".sidebar-toggle");
const sidebar = document.querySelector(".sidebar");
const searchForm = document.querySelector(".search-form");
const themeToggleBtn = document.querySelector(".theme-toggle");
const themeIcon = document.querySelector(".theme-icon");
const menuLinks = document.querySelectorAll(".menu-link");

// Updates the theme icon based on current theme and sidebar state
const updateThemeIcon = () => {
  const isDark = document.body.classList.contains("dark-theme");
  themeIcon.textContent = sidebar.classList.contains("collapsed") ? (isDark ? "light_mode" : "dark_mode") : "dark_mode";
};

// Apply dark theme if saved or system prefers, then update icon
const savedTheme = localStorage.getItem("theme");
const systemPrefersDark = window.matchMedia("(prefers-color-scheme: dark)").matches;
const shouldUseDarkTheme = savedTheme === "dark" || (!savedTheme && systemPrefersDark);

document.body.classList.toggle("dark-theme", shouldUseDarkTheme);
updateThemeIcon();

// Toggle between themes on theme button click
themeToggleBtn.addEventListener("click", () => {
  const isDark = document.body.classList.toggle("dark-theme");
  localStorage.setItem("theme", isDark ? "dark" : "light");
  updateThemeIcon();
});

// Toggle sidebar collapsed state on buttons click
sidebarToggleBtns.forEach((btn) => {
  btn.addEventListener("click", () => {
    sidebar.classList.toggle("collapsed");
    updateThemeIcon();
  });
});

// Expand the sidebar when the search form is clicked
searchForm.addEventListener("click", () => {
  if (sidebar.classList.contains("collapsed")) {
    sidebar.classList.remove("collapsed");
    searchForm.querySelector("input").focus();
  }
});

// Expand sidebar by default on large screens
if (window.innerWidth > 768) sidebar.classList.remove("collapsed");

// Content switching logic
const contents = document.querySelectorAll(".main-content .content");
menuLinks.forEach(link => {
  link.addEventListener("click", (e) => {
    e.preventDefault();
    const contentId = link.getAttribute("data-content");
    contents.forEach(content => {
      content.style.display = content.classList.contains(contentId) ? "block" : "none";
    });
    menuLinks.forEach(l => l.classList.remove("active"));
    link.classList.add("active");

    // Initialize Memory Card Game if Analytics is selected
    if (contentId === "analytics") {
      initializeMemoryGame();
    }
    // Initialize Drawing App if Notifications is selected
    if (contentId === "notifications") {
      initializeDrawingApp();
    }
    if (contentId === "favourites") {
      initializePiano();
    }

    if (contentId === "products"){
      initializeImageEditor();
    }

    if (contentId === "customers") {
    initializeHangman();
}

  });
});

// Memory Card Game JavaScript
function initializeMemoryGame() {
  const cards = document.querySelectorAll(".memory-game-wrapper .card");
  let matched = 0;
  let cardOne, cardTwo;
  let disableDeck = false;

  function flipCard({target: clickedCard}) {
    if (cardOne !== clickedCard && !disableDeck) {
      clickedCard.classList.add("flip");
      if (!cardOne) {
        return cardOne = clickedCard;
      }
      cardTwo = clickedCard;
      disableDeck = true;
      let cardOneImg = cardOne.querySelector(".back-view img").src,
          cardTwoImg = cardTwo.querySelector(".back-view img").src;
      matchCards(cardOneImg, cardTwoImg);
    }
  }

  function matchCards(img1, img2) {
    if (img1 === img2) {
      matched++;
      if (matched == 8) {
        setTimeout(() => {
          return shuffleCard();
        }, 1000);
      }
      cardOne.removeEventListener("click", flipCard);
      cardTwo.removeEventListener("click", flipCard);
      cardOne = cardTwo = "";
      return disableDeck = false;
    }
    setTimeout(() => {
      cardOne.classList.add("shake");
      cardTwo.classList.add("shake");
    }, 400);

    setTimeout(() => {
      cardOne.classList.remove("shake", "flip");
      cardTwo.classList.remove("shake", "flip");
      cardOne = cardTwo = "";
      disableDeck = false;
    }, 1200);
  }

  function shuffleCard() {
    matched = 0;
    disableDeck = false;
    cardOne = cardTwo = "";
    let arr = [1, 2, 3, 4, 5, 6, 7, 8, 1, 2, 3, 4, 5, 6, 7, 8];
    arr.sort(() => Math.random() > 0.5 ? 1 : -1);
    cards.forEach((card, i) => {
      card.classList.remove("flip");
      let imgTag = card.querySelector(".back-view img");
      imgTag.src = `images/img-${arr[i]}.png`;
      card.addEventListener("click", flipCard);
    });
  }

  // Remove existing event listeners to prevent duplicates
  cards.forEach(card => {
    card.removeEventListener("click", flipCard);
    card.addEventListener("click", flipCard);
  });

  shuffleCard();
}

// Drawing App JavaScript
function initializeDrawingApp() {
  const canvas = document.querySelector(".drawing-app-container canvas"),
        toolBtns = document.querySelectorAll(".drawing-app-container .tool"),
        fillColor = document.querySelector(".drawing-app-container #fill-color"),
        sizeSlider = document.querySelector(".drawing-app-container #size-slider"),
        colorBtns = document.querySelectorAll(".drawing-app-container .colors .option"),
        colorPicker = document.querySelector(".drawing-app-container #color-picker"),
        clearCanvas = document.querySelector(".drawing-app-container .clear-canvas"),
        saveImg = document.querySelector(".drawing-app-container .save-img"),
        ctx = canvas.getContext("2d");

  // Global variables with default value
  let prevMouseX, prevMouseY, snapshot,
      isDrawing = false,
      selectedTool = "brush",
      brushWidth = 5,
      selectedColor = "#000";

  const setCanvasBackground = () => {
    ctx.fillStyle = "#fff";
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = selectedColor;
  };

  const initializeCanvas = () => {
    canvas.width = canvas.offsetWidth;
    canvas.height = canvas.offsetHeight;
    setCanvasBackground();
  };

  const drawRect = (e) => {
    if (!fillColor.checked) {
      return ctx.strokeRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
    }
    ctx.fillRect(e.offsetX, e.offsetY, prevMouseX - e.offsetX, prevMouseY - e.offsetY);
  };

  const drawCircle = (e) => {
    ctx.beginPath();
    let radius = Math.sqrt(Math.pow((prevMouseX - e.offsetX), 2) + Math.pow((prevMouseY - e.offsetY), 2));
    ctx.arc(prevMouseX, prevMouseY, radius, 0, 2 * Math.PI);
    fillColor.checked ? ctx.fill() : ctx.stroke();
  };

  const drawTriangle = (e) => {
    ctx.beginPath();
    ctx.moveTo(prevMouseX, prevMouseY);
    ctx.lineTo(e.offsetX, e.offsetY);
    ctx.lineTo(prevMouseX * 2 - e.offsetX, e.offsetY);
    ctx.closePath();
    fillColor.checked ? ctx.fill() : ctx.stroke();
  };

  const startDraw = (e) => {
    isDrawing = true;
    prevMouseX = e.offsetX;
    prevMouseY = e.offsetY;
    ctx.beginPath();
    ctx.lineWidth = brushWidth;
    ctx.strokeStyle = selectedColor;
    ctx.fillStyle = selectedColor;
    snapshot = ctx.getImageData(0, 0, canvas.width, canvas.height);
  };

  const drawing = (e) => {
    if (!isDrawing) return;
    ctx.putImageData(snapshot, 0, 0);

    if (selectedTool === "brush" || selectedTool === "eraser") {
      ctx.strokeStyle = selectedTool === "eraser" ? "#fff" : selectedColor;
      ctx.lineTo(e.offsetX, e.offsetY);
      ctx.stroke();
    } else if (selectedTool === "rectangle") {
      drawRect(e);
    } else if (selectedTool === "circle") {
      drawCircle(e);
    } else {
      drawTriangle(e);
    }
  };

  // Remove existing event listeners to prevent duplicates
  toolBtns.forEach(btn => {
    btn.removeEventListener("click", () => {});
    btn.addEventListener("click", () => {
      document.querySelector(".drawing-app-container .options .active").classList.remove("active");
      btn.classList.add("active");
      selectedTool = btn.id;
    });
  });

  sizeSlider.removeEventListener("change", () => {});
  sizeSlider.addEventListener("change", () => brushWidth = sizeSlider.value);

  colorBtns.forEach(btn => {
    btn.removeEventListener("click", () => {});
    btn.addEventListener("click", () => {
      document.querySelector(".drawing-app-container .options .selected").classList.remove("selected");
      btn.classList.add("selected");
      selectedColor = window.getComputedStyle(btn).getPropertyValue("background-color");
    });
  });

  colorPicker.removeEventListener("change", () => {});
  colorPicker.addEventListener("change", () => {
    colorPicker.parentElement.style.background = colorPicker.value;
    colorPicker.parentElement.click();
  });

  clearCanvas.removeEventListener("click", () => {});
  clearCanvas.addEventListener("click", () => {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setCanvasBackground();
  });

  saveImg.removeEventListener("click", () => {});
  saveImg.addEventListener("click", () => {
    const link = document.createElement("a");
    link.download = `${Date.now()}.jpg`;
    link.href = canvas.toDataURL();
    link.click();
  });

  canvas.removeEventListener("mousedown", startDraw);
  canvas.removeEventListener("mousemove", drawing);
  canvas.removeEventListener("mouseup", () => {});
  canvas.addEventListener("mousedown", startDraw);
  canvas.addEventListener("mousemove", drawing);
  canvas.addEventListener("mouseup", () => isDrawing = false);

  // Initialize canvas on load
  initializeCanvas();

  // Re-initialize canvas on window resize
  window.addEventListener("resize", initializeCanvas);
}

// Piano JavaScript
function initializePiano() {
  const pianoKeys = document.querySelectorAll(".piano-wrapper .key"),
        volumeSlider = document.querySelector(".piano-wrapper .volume-slider input"),
        keysCheckbox = document.querySelector(".piano-wrapper .keys-checkbox input");

  let allKeys = [],
      audio = new Audio(`tunes/a.wav`);

  const playTune = (key) => {
    audio.src = `tunes/${key}.wav`;
    audio.play();
    const clickedKey = document.querySelector(`.piano-wrapper [data-key="${key}"]`);
    clickedKey.classList.add("active");
    setTimeout(() => {
      clickedKey.classList.remove("active");
    }, 150);
  };

  pianoKeys.forEach((key) => {
    allKeys.push(key.dataset.key);
    // Ngăn chặn sự kiện trùng lặp
    key.removeEventListener("click", () => {});
    key.addEventListener("click", () => playTune(key.dataset.key));
  });

  const handleVolume = (e) => {
    audio.volume = e.target.value;
  };

  const showHideKeys = () => {
    pianoKeys.forEach((key) => key.classList.toggle("hide"));
  };

  const pressedKey = (e) => {
    // Chỉ xử lý khi Favourites đang hiển thị
    if (document.querySelector(".content.favourites").style.display === "block" && allKeys.includes(e.key)) {
      playTune(e.key);
    }
  };

  // Ngăn chặn sự kiện trùng lặp
  keysCheckbox.removeEventListener("click", showHideKeys);
  volumeSlider.removeEventListener("input", handleVolume);
  document.removeEventListener("keydown", pressedKey);

  keysCheckbox.addEventListener("click", showHideKeys);
  volumeSlider.addEventListener("input", handleVolume);
  document.addEventListener("keydown", pressedKey);

  // Xóa sự kiện keydown khi rời khỏi Favourites
  const menuLinks = document.querySelectorAll(".menu-link");
  menuLinks.forEach(link => {
    link.removeEventListener("click", () => {});
    link.addEventListener("click", (e) => {
      if (link.getAttribute("data-content") !== "favourites") {
        document.removeEventListener("keydown", pressedKey);
      }
    });
  });
}

// === PROFILE SLIDER ===
let currentSlide = 0;
const slides = document.querySelector('.slides');
const totalSlides = document.querySelectorAll('.slide').length;
const dots = document.querySelector('.dots');

if (slides && dots) {
  for (let i = 0; i < totalSlides; i++) {
    const dot = document.createElement('span');
    dot.addEventListener('click', () => goToSlide(i));
    dots.appendChild(dot);
  }
  updateDots();
}

function updateDots() {
  document.querySelectorAll('.dots span').forEach((dot, index) => {
    dot.classList.toggle('active', index === currentSlide);
  });
}

function goToSlide(index) {
  currentSlide = index;
  if (currentSlide < 0) currentSlide = totalSlides - 1;
  if (currentSlide >= totalSlides) currentSlide = 0;
  slides.style.transform = `translateX(-${currentSlide * 310}px)`;
  updateDots();
}

function nextSlide() {
  goToSlide(currentSlide + 1);
}

function prevSlide() {
  goToSlide(currentSlide - 1);
}

setInterval(nextSlide, 3000);

// Hàm khởi tạo Image Editor

document.addEventListener("DOMContentLoaded", () => {
  // Khởi tạo sự kiện cho menu
  const menuLinks = document.querySelectorAll(".menu-link");
  menuLinks.forEach(link => {
      link.addEventListener("click", (e) => {
          e.preventDefault();
          const content = link.getAttribute("data-content");
          document.querySelectorAll(".content").forEach(item => item.style.display = "none");
          const targetContent = document.querySelector(`.content.${content}`);
          if (targetContent) {
              targetContent.style.display = "block";
              // Gọi Image Editor chỉ khi ở Products
              if (content === "products") {
                  initializeImageEditor();
              }
          } else {
              console.error(`Content with class '${content}' not found!`);
          }
      });
  });

  // Hàm khởi tạo Image Editor
  function initializeImageEditor() {
      const fileInput = document.querySelector(".image-editor .file-input"),
            filterOptions = document.querySelectorAll(".image-editor .filter button"),
            filterName = document.querySelector(".image-editor .filter-info .name"),
            filterValue = document.querySelector(".image-editor .filter-info .value"),
            filterSlider = document.querySelector(".image-editor .slider input"),
            rotateOptions = document.querySelectorAll(".image-editor .rotate button"),
            previewImg = document.querySelector(".image-editor .preview-img img"),
            resetFilterBtn = document.querySelector(".image-editor .reset-filter"),
            chooseImgBtn = document.querySelector(".image-editor .choose-img"),
            saveImgBtn = document.querySelector(".image-editor .save-img");

      let brightness = "100", saturation = "100", inversion = "0", grayscale = "0";
      let rotate = 0, flipHorizontal = 1, flipVertical = 1;

      const loadImage = () => {
          let file = fileInput.files[0];
          if (!file) return;
          previewImg.src = URL.createObjectURL(file);
          previewImg.addEventListener("load", () => {
              resetFilterBtn.click();
              document.querySelector(".image-editor").classList.remove("disable");
          });
      }

      const applyFilter = () => {
          previewImg.style.transform = `rotate(${rotate}deg) scale(${flipHorizontal}, ${flipVertical})`;
          previewImg.style.filter = `brightness(${brightness}%) saturate(${saturation}%) invert(${inversion}%) grayscale(${grayscale}%)`;
      }

      filterOptions.forEach(option => {
          option.addEventListener("click", () => {
              document.querySelector(".image-editor .active").classList.remove("active");
              option.classList.add("active");
              filterName.innerText = option.innerText;

              if (option.id === "brightness") {
                  filterSlider.max = "200";
                  filterSlider.value = brightness;
                  filterValue.innerText = `${brightness}%`;
              } else if (option.id === "saturation") {
                  filterSlider.max = "200";
                  filterSlider.value = saturation;
                  filterValue.innerText = `${saturation}%`;
              } else if (option.id === "inversion") {
                  filterSlider.max = "100";
                  filterSlider.value = inversion;
                  filterValue.innerText = `${inversion}%`;
              } else {
                  filterSlider.max = "100";
                  filterSlider.value = grayscale;
                  filterValue.innerText = `${grayscale}%`;
              }
          });
      });

      const updateFilter = () => {
          filterValue.innerText = `${filterSlider.value}%`;
          const selectedFilter = document.querySelector(".image-editor .filter .active");

          if (selectedFilter.id === "brightness") {
              brightness = filterSlider.value;
          } else if (selectedFilter.id === "saturation") {
              saturation = filterSlider.value;
          } else if (selectedFilter.id === "inversion") {
              inversion = filterSlider.value;
          } else {
              grayscale = filterSlider.value;
          }
          applyFilter();
      }

      rotateOptions.forEach(option => {
          option.addEventListener("click", () => {
              if (option.id === "left") {
                  rotate -= 90;
              } else if (option.id === "right") {
                  rotate += 90;
              } else if (option.id === "horizontal") {
                  flipHorizontal = flipHorizontal === 1 ? -1 : 1;
              } else {
                  flipVertical = flipVertical === 1 ? -1 : 1;
              }
              applyFilter();
          });
      });

      const resetFilter = () => {
          brightness = "100"; saturation = "100"; inversion = "0"; grayscale = "0";
          rotate = 0; flipHorizontal = 1; flipVertical = 1;
          filterOptions[0].click();
          applyFilter();
      }

      const saveImage = () => {
          const canvas = document.createElement("canvas");
          const ctx = canvas.getContext("2d");
          canvas.width = previewImg.naturalWidth;
          canvas.height = previewImg.naturalHeight;
          
          ctx.filter = `brightness(${brightness}%) saturate(${saturation}%) invert(${inversion}%) grayscale(${grayscale}%)`;
          ctx.translate(canvas.width / 2, canvas.height / 2);
          if (rotate !== 0) {
              ctx.rotate(rotate * Math.PI / 180);
          }
          ctx.scale(flipHorizontal, flipVertical);
          ctx.drawImage(previewImg, -canvas.width / 2, -canvas.height / 2, canvas.width, canvas.height);
          
          const link = document.createElement("a");
          link.download = "image.jpg";
          link.href = canvas.toDataURL();
          link.click();
      }

      filterSlider.addEventListener("input", updateFilter);
      resetFilterBtn.addEventListener("click", resetFilter);
      saveImgBtn.addEventListener("click", saveImage);
      fileInput.addEventListener("change", loadImage);
      chooseImgBtn.addEventListener("click", () => fileInput.click());
  }

  // Kích hoạt phần mặc định (Profile)
  document.querySelector(".content.dashboard").style.display = "block";
});







function initializeHangman() {
    const wordDisplay = document.querySelector(".content.customers .word-display");
    const guessesText = document.querySelector(".content.customers .guesses-text b");
    const keyboardDiv = document.querySelector(".content.customers .keyboard");
    const hangmanImage = document.querySelector(".content.customers .hangman-box img");
    const gameModal = document.querySelector(".content.customers .game-modal");
    const playAgainBtn = gameModal.querySelector(".play-again");

    // Initializing game variables
    let currentWord, correctLetters, wrongGuessCount;
    const maxGuesses = 6;

    const resetGame = () => {
        correctLetters = [];
        wrongGuessCount = 0;
        hangmanImage.src = "images/hangman-0.svg";
        guessesText.innerText = `${wrongGuessCount} / ${maxGuesses}`;
        wordDisplay.innerHTML = currentWord.split("").map(() => `<li class="letter"></li>`).join("");
        keyboardDiv.querySelectorAll("button").forEach(btn => btn.disabled = false);
        gameModal.classList.remove("show");
    }

    const getRandomWord = () => {
        const { word, hint } = wordList[Math.floor(Math.random() * wordList.length)];
        currentWord = word;
        document.querySelector(".content.customers .hint-text b").innerText = hint;
        resetGame();
    }

    const gameOver = (isVictory) => {
        const modalText = isVictory ? `You found the word:` : 'The correct word was:';
        gameModal.querySelector("img").src = `images/${isVictory ? 'victory' : 'lost'}.gif`;
        gameModal.querySelector("h4").innerText = isVictory ? 'Congrats!' : 'Game Over!';
        gameModal.querySelector("p").innerHTML = `${modalText} <b>${currentWord}</b>`;
        gameModal.classList.add("show");
    }

    const initGame = (button, clickedLetter) => {
        if (currentWord.includes(clickedLetter)) {
            [...currentWord].forEach((letter, index) => {
                if (letter === clickedLetter) {
                    correctLetters.push(letter);
                    wordDisplay.querySelectorAll("li")[index].innerText = letter;
                    wordDisplay.querySelectorAll("li")[index].classList.add("guessed");
                }
            });
        } else {
            wrongGuessCount++;
            hangmanImage.src = `images/hangman-${wrongGuessCount}.svg`;
        }
        button.disabled = true;
        guessesText.innerText = `${wrongGuessCount} / ${maxGuesses}`;

        if (wrongGuessCount === maxGuesses) return gameOver(false);
        if (correctLetters.length === currentWord.length) return gameOver(true);
    }

    // Remove existing buttons to prevent duplicates
    keyboardDiv.innerHTML = "";
    // Creating keyboard buttons
    for (let i = 97; i <= 122; i++) {
        const button = document.createElement("button");
        button.innerText = String.fromCharCode(i);
        keyboardDiv.appendChild(button);
        button.addEventListener("click", (e) => initGame(e.target, String.fromCharCode(i)));
    }

    getRandomWord();
    playAgainBtn.addEventListener("click", getRandomWord);
}