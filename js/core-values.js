const steps = [
    {
        id: 1,
        title: "Değer Seçimi",
        description: "Aşağıdaki listeden sizin için önemli olduğunu düşündüğünüz 10 tane madde seçiniz!",
        handler: stepSelection
    },
    {
        id: 2,
        title: "Karşılaştırma",
        description: "Seçtiğiniz maddelerin karşılaştırmasını yapıyor olacaksınız. Sizin için en önemli olan maddeyi seçiniz!",
        handler: stepFirstCompare
    },
    {
        id: 3,
        title: "Son Değerlendirme",
        description: "Son bir karşılatırma daha yapacaksınız. Sizin için en önemli olan maddeyi seçiniz!",
        handler: stepLastCompare
    },
    {
        id: 4,
        title: "Kişisel Değerleriniz",
        description: "Yaptığınız seçimler ve karşılaştırmalar sonucunda kişisel değerleriniz aşağıdaki gibidir.",
        handler: stepResult
    }
];

let values = [];

function _createValueItem(key, english, turkish) {
    return {
        key: key,
        english: english,
        turkish: turkish,
        selected: false,
        vote: 0,
        secondVote: 0,
        ratio: function () {
            return parseFloat((this.vote / 45.0).toFixed(2));
        },
        result: function () {
            return parseFloat((this.secondVote / 10.0).toFixed(4));
        }
    };
}

values.push(_createValueItem("accountability", "Accountability", "Hesap verebilirlik Sorumluluk"));
values.push(_createValueItem("accuracy", "Accuracy", "Doğruluk"));
values.push(_createValueItem("achievement", "Achievement", "Kazanım Başarı"));
values.push(_createValueItem("adventurousness", "Adventurousness", "Maceracılık"));
values.push(_createValueItem("altruism", "Altruism", "Özgecilik Başkalarını Düşünme"));
values.push(_createValueItem("ambition", "Ambition", "Hırs - Tutku"));
values.push(_createValueItem("assertiveness", "Assertiveness", "Kendine Güven"));
values.push(_createValueItem("balance", "Balance", "Denge"));
values.push(_createValueItem("being-the-best", "Being the best", "En İyi Olmak"));
values.push(_createValueItem("belonging", "Belonging", "Aidiyet"));
values.push(_createValueItem("boldness", "Boldness", "Cesaret Yüzsüzlük"));
values.push(_createValueItem("calmness", "Calmness", "Dinginlik"));
values.push(_createValueItem("carefulness", "Carefulness", "Dikkatlilik"));
values.push(_createValueItem("challenge", "Challenge", "Meydan Okuma"));
values.push(_createValueItem("cheerfulness", "Cheerfulness", "Neşe"));
values.push(_createValueItem("clear-mindedness", "Clear-mindedness", "Açık Fikirlilik"));
values.push(_createValueItem("commitment", "Commitment", "Taahhüt Sözünü Yerine Getirme"));
values.push(_createValueItem("community", "Community", "Topluluk"));
values.push(_createValueItem("compassion", "Compassion", "Merhamet"));
values.push(_createValueItem("competitiveness", "Competitiveness", "Rekabet"));
values.push(_createValueItem("consistency", "Consistency", "Tutarlılık"));
values.push(_createValueItem("contentment", "Contentment", "Hoşnutluk Memnuniyet"));
values.push(_createValueItem("continuous-improvement", "Continuous Improvement", "Devamlı Gelişim"));
values.push(_createValueItem("contribution", "Contribution", "Katkı Sağlamak"));
values.push(_createValueItem("control", "Control", "Kontrol Etmek"));
values.push(_createValueItem("cooperation", "Cooperation", "İş Birliği"));
values.push(_createValueItem("correctness", "Correctness", "Doğruluk Dürüstlük"));
values.push(_createValueItem("courtesy", "Courtesy", "Nezaket"));
values.push(_createValueItem("creativity", "Creativity", "Yaratıcılık"));
values.push(_createValueItem("curiosity", "Curiosity", "Merak"));
values.push(_createValueItem("decisiveness", "Decisiveness", "Belirleyicilik Karar Vermek"));
values.push(_createValueItem("democraticness", "Democraticness", "Demoktarik"));
values.push(_createValueItem("dependability", "Dependability", "Güvenilebilirlik"));
values.push(_createValueItem("determination", "Determination", "Kararlılık"));
values.push(_createValueItem("devoutness", "Devoutness", "Ciddiyet"));
values.push(_createValueItem("diligence", "Diligence", "Çalışkanlık Çabalamak"));
values.push(_createValueItem("discipline", "Discipline", "Disiplin"));
values.push(_createValueItem("discretion", "Discretion", "İhtiyat Tedbirli Olmak"));
values.push(_createValueItem("diversity", "Diversity", "Çeşitlilik Farklılık"));
values.push(_createValueItem("dynamism", "Dynamism", "Dinamizm"));
values.push(_createValueItem("economy", "Economy", "Ekonomi"));
values.push(_createValueItem("effectiveness", "Effectiveness", "Etkili Olmak Geçerlilik"));
values.push(_createValueItem("efficiency", "Efficiency", "Verim"));
values.push(_createValueItem("elegance", "Elegance", "Zarafet"));
values.push(_createValueItem("empathy", "Empathy", "Empati"));
values.push(_createValueItem("enjoyment", "Enjoyment", "Hoşlanma Zevk Alma"));
values.push(_createValueItem("enthusiasm", "Enthusiasm", "Coşku - Heyecan"));
values.push(_createValueItem("equality", "Equality", "Eşitlik"));
values.push(_createValueItem("excellence", "Excellence", "Mükemmellik"));
values.push(_createValueItem("excitement", "Excitement", "Heyecan - Coşku"));
values.push(_createValueItem("expertise", "Expertise", "Uzmanlık"));
values.push(_createValueItem("exploration", "Exploration", "Keşif"));
values.push(_createValueItem("expressiveness", "Expressiveness", "Etkileyicilik"));
values.push(_createValueItem("fairness", "Fairness", "Adalet"));
values.push(_createValueItem("faith", "Faith", "İnanç"));
values.push(_createValueItem("family-orientedness", "Family-orientedness", "Aile Odaklığı Aile"));
values.push(_createValueItem("fidelity", "Fidelity", "Doğruluk - Vefa"));
values.push(_createValueItem("fitness", "Fitness", "Sağlık Fit Olmak"));
values.push(_createValueItem("fluency", "Fluency", "Akıcılık"));
values.push(_createValueItem("focus", "Focus", "Odaklanmak"));
values.push(_createValueItem("freedom", "Freedom", "Özgürlük"));
values.push(_createValueItem("fun", "Fun", "Eğlence Eğlenmek"));
values.push(_createValueItem("generosity", "Generosity", "Cömertlik"));
values.push(_createValueItem("goodness", "Goodness", "İyilik"));
values.push(_createValueItem("grace", "Grace", "Lütuf - Zarafet"));
values.push(_createValueItem("growth", "Growth", "Büyüme - Gelişme"));
values.push(_createValueItem("happiness", "Happiness", "Mutluluk"));
values.push(_createValueItem("hard-work", "Hard Work", "Çok Çalışmak"));
values.push(_createValueItem("health", "Health", "Sağlık"));
values.push(_createValueItem("helping-society", "Helping Society", "Topluma Yardım Etmek"));
values.push(_createValueItem("holiness", "Holiness", "Kutsallık"));
values.push(_createValueItem("honesty", "Honesty", "Dürüstlük"));
values.push(_createValueItem("honor", "Honor", "Onur Şeref"));
values.push(_createValueItem("humility", "Humility", "Tevazu Alçakgönüllülük"));
values.push(_createValueItem("independence", "Independence", "Bağımsızlık"));
values.push(_createValueItem("ingenuity", "Ingenuity", "Marifet Yaratıcılık"));
values.push(_createValueItem("inner-harmony", "Inner Harmony", "İç Uyum İç Huzur"));
values.push(_createValueItem("inquisitiveness", "Inquisitiveness", "Meraklılık Çok Soru Sorma"));
values.push(_createValueItem("insightfulness", "Insightfulness", "İç Görülü Olma"));
values.push(_createValueItem("intelligence", "Intelligence", "Zeka - Akıl"));
values.push(_createValueItem("intellectual-status", "Intellectual Status", "Fikir Durum"));
values.push(_createValueItem("intuition", "Intuition", "Sezgi - Önsezi"));
values.push(_createValueItem("joy", "Joy", "Sevinç - Neşe"));
values.push(_createValueItem("justice", "Justice", "Adalet - Yargı"));
values.push(_createValueItem("leadership", "Leadership", "Liderlik"));
values.push(_createValueItem("legacy", "Legacy", "Miras"));
values.push(_createValueItem("love", "Love", "Aşk"));
values.push(_createValueItem("loyalty", "Loyalty", "Bağlılık - Sadakat"));
values.push(_createValueItem("making-a-difference", "Making a difference", "Fark Yaratmak"));
values.push(_createValueItem("mastery", "Mastery", "Ustalık"));
values.push(_createValueItem("merit", "Merit", "Övgü Övgü Almak"));
values.push(_createValueItem("obedience", "Obedience", "İtaat"));
values.push(_createValueItem("openness", "Openness", "Açıklık"));
values.push(_createValueItem("order", "Order", "Emir Etmek Emir Vermek"));
values.push(_createValueItem("originality", "Originality", "Özgünlük Orjinallik"));
values.push(_createValueItem("patriotism", "Patriotism", "Vatanseverlik"));
values.push(_createValueItem("perfection", "Perfection", "Mükemmellik Kusursuzluk"));
values.push(_createValueItem("piety", "Piety", "Dindarlık"));
values.push(_createValueItem("positivity", "Positivity", "Pozitif Olma Pozitif Bakma"));
values.push(_createValueItem("practicality", "Practicality", "Pratiklik"));
values.push(_createValueItem("preparedness", "Preparedness", "Hazırlıklı Olma Hazır Olma"));
values.push(_createValueItem("professionalism", "Professionalism", "Profesyonellik"));
values.push(_createValueItem("prudence", "Prudence", "İhtiyat Sağduyu"));
values.push(_createValueItem("quality-orientation", "Quality-orientation", "Kalite Odaklılık"));
values.push(_createValueItem("reliability", "Reliability", "Güvenilebilirlik Dayanıklılık"));
values.push(_createValueItem("resourcefulness", "Resourcefulness", "Beceriklilik"));
values.push(_createValueItem("restraint", "Restraint", "Kısıtlama Sınırlandırma"));
values.push(_createValueItem("results-oriented", "Results-oriented", "Sonuç Odaklılık"));
values.push(_createValueItem("rigor", "Rigor", "Titizlik Kesinlik"));
values.push(_createValueItem("security", "Security", "Güvenlik"));
values.push(_createValueItem("self-actualization", "Self-actualization", "Öz Gerçekleştirim"));
values.push(_createValueItem("self-control", "Self-control", "Oto Kontrol"));
values.push(_createValueItem("selflessness", "Selflessness", "Kendinden Çok Başkalarını Düşünme"));
values.push(_createValueItem("self-reliance", "Self-reliance", "Kendine Güven Özgüven"));
values.push(_createValueItem("sensitivity", "Sensitivity", "Duyarlılık Hassaslık"));
values.push(_createValueItem("serenity", "Serenity", "Huzur Sükunet"));
values.push(_createValueItem("service", "Service", "Hizmet Etme"));
values.push(_createValueItem("shrewdness", "Shrewdness", "Zekilik Açık Gözlülük"));
values.push(_createValueItem("simplicity", "Simplicity", "Basitlik"));
values.push(_createValueItem("soundness", "Soundness", "Sağlamlık Esenlik"));
values.push(_createValueItem("speed", "Speed", "Hız"));
values.push(_createValueItem("spontaneity", "Spontaneity", "Doğallık Kendinden Olma"));
values.push(_createValueItem("stability", "Stability", "İstikrar Kararlılık"));
values.push(_createValueItem("strategic", "Strategic", "Stratejik Olma"));
values.push(_createValueItem("strength", "Strength", "Güç - Kuvvet"));
values.push(_createValueItem("structure", "Structure", "Bütün Olarak Düşünmek"));
values.push(_createValueItem("success", "Success", "Başarı"));
values.push(_createValueItem("support", "Support", "Destek"));
values.push(_createValueItem("teamwork", "Teamwork", "Takım Çalışması"));
values.push(_createValueItem("temperance", "Temperance", "Ölçülülük Ilımlı Olma"));
values.push(_createValueItem("thankfulness", "Thankfulness", "Şükran - Minnet"));
values.push(_createValueItem("thoroughness", "Thoroughness", "Titizlik Tam Olma"));
values.push(_createValueItem("thoughtfulness", "Thoughtfulness", "Düşüncelilik Özen Gösterme"));
values.push(_createValueItem("timeliness", "Timeliness", "Vakitlilik Dakiklik"));
values.push(_createValueItem("tolerance", "Tolerance", "Hata Payı Toleranslı Olma"));
values.push(_createValueItem("traditionalism", "Traditionalism", "Gelenekselcilik"));
values.push(_createValueItem("trustworthiness", "Trustworthiness", "Güvenilir Olma"));
values.push(_createValueItem("truth-seeking", "Truth-seeking", "Doğruculuk Gerçeği Arama"));
values.push(_createValueItem("understanding", "Understanding", "Anlayış"));
values.push(_createValueItem("uniqueness", "Uniqueness", "Benzersizlik"));
values.push(_createValueItem("unity", "Unity", "Birlik - Bütünlük"));
values.push(_createValueItem("usefulness", "Usefulness", "Kullanışlılık Fayda"));
values.push(_createValueItem("vision", "Vision", "Vizyon"));
values.push(_createValueItem("vitality", "Vitality", "Dirilik Yaşama Gücü"));

const insertionPointSelector = "main";

function _getRoot() {
    let $rootElement = document.getElementById("pnlCode");
    if ($rootElement) {
        return $rootElement;
    }

    let $insertionPoint = document.querySelector(insertionPointSelector);
    if (!$insertionPoint) {
        console.error("insertion point cannot find.");
        return;
    }

    $rootElement = document.createElement("div");
    $rootElement.setAttribute("id", "pnlCode");

    $insertionPoint.appendChild($rootElement)

    return $rootElement;
}

function _getRandomNumber(length) {

    if (length <= 0) {
        length = 1;
    }

    const crypto = window.crypto || window.msCrypto;
    var array = new Uint32Array(length);
    crypto.getRandomValues(array);

    return array;
}

function _shuffle(data) {
    var randomValues = _getRandomNumber(data.length * 2);
    var x = 0;

    for (var i = data.length - 1; i > 0; i--) {
        var j = Math.floor(randomValues[++x] * (i + 1));
        j = j % data.length;

        var temp = data[i];
        data[i] = data[j];
        data[j] = temp;
    }

    return data;
}

var currentStep = 1;

function _renderSteps() {
    steps.forEach((step) => {
        if (step.id !== currentStep) {
            return;
        }

        _renderStep(step);
    });
}

function _nextStep() {
    currentStep++;

    let $rootElement = _getRoot();
    $rootElement.innerHTML = "";
    _renderSteps();
}

function _renderStep(step) {
    let $rootElement = _getRoot();

    let $title = document.createElement("h2");
    $title.innerHTML = step.title;
    $rootElement.appendChild($title);

    let $description = document.createElement("p");
    $description.innerHTML = step.description;
    $rootElement.appendChild($description);

    window.scrollTo(0, 0);

    step.handler.call(this, $rootElement);
}

function _createMatrix(data) {
    let matrix = {};

    data.forEach(x => {
        data.forEach(y => {

            if (x.key !== y.key) {
                let index = x.key + "-" + y.key;
                let reverseIndex = y.key + "-" + x.key;

                if (matrix[index] || matrix[reverseIndex]) {
                    return;
                }

                matrix[index] = {
                    x: x,
                    xKey: index,
                    y: y,
                    yKey: reverseIndex,
                    value: 0
                };
            }
        });
    });

    return matrix;
}

function _addRadioSet(key, dataKey, groupName, label, title, $rootElement) {
    let $valueContainer = document.createElement("div");
    $valueContainer.classList.add("value-container");

    let $valueElement = document.createElement("input");
    $valueElement.setAttribute("id", "rb_" + key);
    $valueElement.setAttribute("type", "radio");
    $valueElement.setAttribute("name", groupName);
    $valueElement.setAttribute("data-key", dataKey);

    let $valueLabel = document.createElement("label");
    $valueLabel.setAttribute("for", "rb_" + key);
    $valueLabel.innerHTML = label;
    $valueLabel.title = title;

    $valueContainer.appendChild($valueElement);
    $valueContainer.appendChild($valueLabel);

    $rootElement.appendChild($valueContainer);

    $valueContainer.addEventListener("click", () => {
        $valueElement.checked = true;

        if ($valueContainer.parentNode) {
            $valueContainer.parentNode.classList.remove("error");
        }
    });
}

function _renderCompareTable(data, $container) {

    for (let i = 0; i < data.length; i++) {
        const value = data[i];

        let $groupContainer = document.createElement("div");
        $groupContainer.classList.add("group-container");

        _addRadioSet(value.xKey, value.x.key, value.xKey, value.x.turkish, value.x.english, $groupContainer);
        _addRadioSet(value.yKey, value.y.key, value.xKey, value.y.turkish, value.y.english, $groupContainer);

        $container.appendChild($groupContainer);
    }
}

function stepSelection($rootElement) {

    let data = values;

    var $container = document.createElement("div");
    $container.setAttribute("id", "pnlContainer");

    for (let i = 0; i < data.length; i++) {
        const value = data[i];

        let $valueContainer = document.createElement("div");
        $valueContainer.classList.add("value-container");

        let $valueElement = document.createElement("input");
        $valueElement.setAttribute("id", "cb_" + value.key);
        $valueElement.setAttribute("type", "checkbox");
        $valueElement.setAttribute("data-key", value.key);

        let $valueLabel = document.createElement("label");
        $valueLabel.setAttribute("for", "cb_" + value.key);
        $valueLabel.innerHTML = value.turkish;
        $valueLabel.title = value.english;

        $valueContainer.appendChild($valueElement);
        $valueContainer.appendChild($valueLabel);
        $container.appendChild($valueContainer);

        $valueContainer.addEventListener("click", () => {
            $valueElement.checked = !$valueElement.checked;
        });
    }

    $rootElement.appendChild($container);

    var $completeButton = document.createElement("button");
    $completeButton.innerHTML = "Seçimi Tamamla";
    $completeButton.classList.add("full");
    $completeButton.classList.add("bold");

    let clickHandler = function () {

        let selectedItems = document.querySelectorAll("input[type=checkbox][data-key]:checked");
        if (selectedItems.length !== 10) {
            alert("Listeden sadece 10 tane değer seçmelisiniz! Şu anda " + selectedItems.length + " seçtiniz.");
            return;
        }

        selectedItems.forEach((item) => {
            let dataKey = item.getAttribute("data-key");
            let index = values.findIndex(({ key }) => key === dataKey);
            values[index].selected = true;
        });

        $completeButton.removeEventListener("click", clickHandler);
        _nextStep();
    };

    $completeButton.addEventListener("click", clickHandler);
    $rootElement.appendChild($completeButton);
}

function _markRadio() {
    let $groups = document.querySelectorAll("div.group-container");
    $groups.forEach(($group) => {
        let count = $group.querySelectorAll("div.value-container input[type=radio]:checked").length;
        if (count === 0) {
            $group.classList.add("error");
        }
        else {
            $group.classList.remove("error");
        }
    });
}

function _addCompareButton(calculationField, buttonText, size, $rootElement) {
    let clickHandler = function () {

        let checkedItems = document.querySelectorAll("input[type=radio]:checked");
        if (checkedItems.length !== size) {
            _markRadio();

            alert("Bütün karşılaştırmaları yamamlayınız!");
            return;
        }

        checkedItems.forEach(item => {
            var dataKey = item.getAttribute("data-key");
            let index = values.findIndex(({ key }) => key === dataKey);
            values[index][calculationField]++;
        });

        $completeButton.removeEventListener("click", clickHandler);
        _nextStep();
    };

    let $completeButton = document.createElement("button");
    $completeButton.innerHTML = buttonText;
    $completeButton.classList.add("full");
    $completeButton.classList.add("bold");
    $completeButton.addEventListener("click", clickHandler);

    $rootElement.appendChild($completeButton);
}

function stepFirstCompare($rootElement) {
    let selection = values.filter((item) => {
        if (item.selected) {
            return true;
        }
    });

    let matrix = _createMatrix(selection);
    let data = _shuffle(Object.values(matrix));

    var $container = document.createElement("div");
    $container.setAttribute("id", "pnlContainer");

    _renderCompareTable(data, $container);
    $rootElement.appendChild($container);

    const calculationField = "vote";
    const buttonText = "Karşılaştırmayı Tamamla";
    _addCompareButton(calculationField, buttonText, data.length, $rootElement);
}

function stepLastCompare($rootElement) {

    let selection = values.filter((item) => {
        if (item.vote > 0) {
            return true;
        }
    }).sort((a, b) => {
        return b.vote - a.vote;
    }).slice(0, 5);

    let matrix = _createMatrix(selection);
    let data = _shuffle(Object.values(matrix));

    var $container = document.createElement("div");
    $container.setAttribute("id", "pnlContainer");

    _renderCompareTable(data, $container);
    $rootElement.appendChild($container);

    const calculationField = "secondVote";
    const buttonText = "Değerlendirmeyi Tamamla";
    _addCompareButton(calculationField, buttonText, data.length, $rootElement);
}

function stepResult($rootElement) {

    let selection = values.filter((item) => {
        if (item.secondVote > 0) {
            return true;
        }
    }).sort((a, b) => {
        return b.result() - a.result();
    });

    var $container = document.createElement("div");
    $container.setAttribute("id", "pnlContainer");

    for (let i = 0; i < selection.length; i++) {
        const item = selection[i];

        let $resultContainer = document.createElement("div");
        $resultContainer.classList.add("result-container");

        let $label = document.createElement("label");
        $label.innerHTML = item.turkish + " (" + item.result() * 100 + "%)";
        $label.title = item.english;
        $label.style.width = item.result() * 100 + "%";

        $resultContainer.appendChild($label);
        $container.appendChild($resultContainer);
    }

    $rootElement.appendChild($container);
}

window.addEventListener("load", () => {
    _renderSteps();
});