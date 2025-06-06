document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById("quizForm");

    questions.forEach((q, index) => {
        const questionCard = document.createElement("div");
        questionCard.className = "question-card";
        questionCard.id = `q${index}`;

        // Текст вопроса
        const questionText = document.createElement("div");
        questionText.className = "question-text";
        questionText.textContent = q.q;
        questionCard.appendChild(questionText);
        if (q.image) {
            const imageContainer = document.createElement("div");
            imageContainer.className = "question-image-container";

            const img = document.createElement("img");
            img.src = q.image;
            img.alt = "Иллюстрация к вопросу";
            img.className = "question-image";

            imageContainer.appendChild(img);
            questionCard.appendChild(imageContainer);
        }

        // Обработка разных типов вопросов
        switch(q.type) {
            case "single":
            case "multiple":
                createOptions(q, index, questionCard);
                break;
            case "text":
                createTextInput(q, index, questionCard);
                break;
            case "order":
                createOrderQuestion(q, index, questionCard);
                break;
        }

        // Добавление пояснения
        if (q.explanation) {
            const faqToggle = document.createElement("button");
            faqToggle.className = "faq-toggle";
            faqToggle.innerHTML = '<i class="fas fa-question-circle"></i> Пояснение';
            faqToggle.onclick = (e) => {
                e.preventDefault();
                const explanation = document.getElementById(`explanation${index}`);
                explanation.classList.toggle("show");
            };

            const explanation = document.createElement("div");
            explanation.className = "explanation";
            explanation.id = `explanation${index}`;
            explanation.innerHTML = `
        <div class="explanation-title"><i class="fas fa-info-circle"></i> Пояснение</div>
        <div class="explanation-text">${q.explanation}</div>
    `;

            questionCard.appendChild(faqToggle);
            questionCard.appendChild(explanation);
        }


        form.appendChild(questionCard);
    });
});

// Создание вариантов ответов
function createOptions(q, index, container) {
    const optionsContainer = document.createElement("div");
    optionsContainer.className = "options-container";

    q.a.forEach((answer, i) => {
        const option = document.createElement("label");
        option.className = "option";

        const input = document.createElement("input");
        input.type = q.type === "multiple" ? "checkbox" : "radio";
        input.name = `q${index}`;
        input.value = i;
        input.onchange = () => highlightCorrect(q, index); // Проверка при выборе

        const checkmark = document.createElement("span");
        checkmark.className = "checkmark";

        const optionText = document.createElement("span");
        optionText.className = "option-text";
        optionText.textContent = answer;

        option.appendChild(input);
        option.appendChild(checkmark);
        option.appendChild(optionText);
        optionsContainer.appendChild(option);
    });

    container.appendChild(optionsContainer);
}

// Создание поля для ввода текста
function createTextInput(q, index, container) {
    const inputGroup = document.createElement("div");
    inputGroup.className = "text-input-group";

    const input = document.createElement("input");
    input.type = "text";
    input.className = "text-input";
    input.dataset.questionIndex = index;
    input.placeholder = "Введите ваш ответ...";
    input.oninput = () => checkTextAnswer(q, index);

    inputGroup.appendChild(input);
    container.appendChild(inputGroup);
}

// Создание вопроса на порядок
function createOrderQuestion(q, index, container) {
    const orderContainer = document.createElement("div");
    orderContainer.className = "order-container";

    q.a.forEach((answer, i) => {
        const item = document.createElement("div");
        item.className = "order-item";
        item.draggable = true;
        item.dataset.index = i;
        item.innerHTML = `
      <span class="order-handle"><i class="fas fa-arrows-alt-v"></i></span>
      <span class="order-text">${answer}</span>
    `;

        item.addEventListener('dragstart', handleDragStart);
        item.addEventListener('dragover', handleDragOver);
        item.addEventListener('drop', handleDrop);
        item.addEventListener('dragend', handleDragEnd);

        orderContainer.appendChild(item);
    });

    container.appendChild(orderContainer);
}

// Проверка текстового ответа
function checkTextAnswer(q, index) {
    const input = document.querySelector(`.text-input[data-question-index="${index}"]`);
    const questionCard = document.getElementById(`q${index}`);

    questionCard.classList.remove("correct", "incorrect");

    if (input.value.trim().toLowerCase() === q.correct.toLowerCase()) {
        questionCard.classList.add("correct");
    } else if (input.value.trim() !== "") {
        questionCard.classList.add("incorrect");
    }
}

// Подсветка правильных ответов
function highlightCorrect(q, index) {
    const questionCard = document.getElementById(`q${index}`);
    const inputs = document.querySelectorAll(`input[name="q${index}"]:checked`);
    const selectedValues = Array.from(inputs).map(input => parseInt(input.value));

    // Сброс предыдущей подсветки
    questionCard.classList.remove("correct", "incorrect");

    // Проверка правильности
    const isCorrect = Array.isArray(q.correct)
        ? JSON.stringify(selectedValues.sort()) === JSON.stringify(q.correct.sort())
        : selectedValues[0] === q.correct;

    if (isCorrect) {
        questionCard.classList.add("correct");
    } else if (selectedValues.length > 0) {
        questionCard.classList.add("incorrect");
    }
}

// Drag and Drop для порядка
let dragSrcEl = null;

function handleDragStart(e) {
    dragSrcEl = this;
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/html', this.innerHTML);
    this.classList.add('dragging');
}

function handleDragOver(e) {
    if (e.preventDefault) e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    return false;
}

function handleDrop(e) {
    if (e.stopPropagation) e.stopPropagation();

    if (dragSrcEl !== this) {
        dragSrcEl.innerHTML = this.innerHTML;
        this.innerHTML = e.dataTransfer.getData('text/html');
    }

    return false;
}

function handleDragEnd() {
    this.classList.remove('dragging');
}