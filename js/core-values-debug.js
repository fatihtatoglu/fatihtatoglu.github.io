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

values.push(_createValueItem("accountability", "Accountability", "Hesap verebilirlik<br>Sorumluluk"));
values.push(_createValueItem("accuracy", "Accuracy", "Doğruluk"));
values.push(_createValueItem("achievement", "Achievement", "Kazanım<br>Başarı"));
values.push(_createValueItem("adventurousness", "Adventurousness", "Maceracılık"));
values.push(_createValueItem("altruism", "Altruism", "Özgecilik<br>Başkalarını Düşünme"));
values.push(_createValueItem("ambition", "Ambition", "Hırs - Tutku"));
values.push(_createValueItem("assertiveness", "Assertiveness", "Kendine Güven"));
values.push(_createValueItem("balance", "Balance", "Denge"));
values.push(_createValueItem("being-the-best", "Being the best", "En İyi Olmak"));
values.push(_createValueItem("belonging", "Belonging", "Aidiyet"));
values.push(_createValueItem("boldness", "Boldness", "Cesaret<br>Yüzsüzlük"));
values.push(_createValueItem("calmness", "Calmness", "Dinginlik"));
values.push(_createValueItem("carefulness", "Carefulness", "Dikkatlilik"));
values.push(_createValueItem("challenge", "Challenge", "Meydan Okuma"));
values.push(_createValueItem("cheerfulness", "Cheerfulness", "Neşe"));
values.push(_createValueItem("clear-mindedness", "Clear-mindedness", "Açık Fikirlilik"));
values.push(_createValueItem("commitment", "Commitment", "Taahhüt<br>Sözünü Yerine Getirme"));
values.push(_createValueItem("community", "Community", "Topluluk"));
values.push(_createValueItem("compassion", "Compassion", "Merhamet"));
values.push(_createValueItem("competitiveness", "Competitiveness", "Rekabet"));
values.push(_createValueItem("consistency", "Consistency", "Tutarlılık"));
values.push(_createValueItem("contentment", "Contentment", "Hoşnutluk<br>Memnuniyet"));
values.push(_createValueItem("continuous-improvement", "Continuous Improvement", "Devamlı Gelişim"));
values.push(_createValueItem("contribution", "Contribution", "Katkı Sağlamak"));
values.push(_createValueItem("control", "Control", "Kontrol Etmek"));
values.push(_createValueItem("cooperation", "Cooperation", "İş Birliği"));
values.push(_createValueItem("correctness", "Correctness", "Doğruluk<br>Dürüstlük"));
values.push(_createValueItem("courtesy", "Courtesy", "Nezaket"));
values.push(_createValueItem("creativity", "Creativity", "Yaratıcılık"));
values.push(_createValueItem("curiosity", "Curiosity", "Merak"));
values.push(_createValueItem("decisiveness", "Decisiveness", "Belirleyicilik<br>Karar Vermek"));
values.push(_createValueItem("democraticness", "Democraticness", "Demoktarik"));
values.push(_createValueItem("dependability", "Dependability", "Güvenilebilirlik"));
values.push(_createValueItem("determination", "Determination", "Kararlılık"));
values.push(_createValueItem("devoutness", "Devoutness", "Ciddiyet"));
values.push(_createValueItem("diligence", "Diligence", "Çalışkanlık<br>Çabalamak"));
values.push(_createValueItem("discipline", "Discipline", "Disiplin"));
values.push(_createValueItem("discretion", "Discretion", "İhtiyat<br>Tedbirli Olmak"));
values.push(_createValueItem("diversity", "Diversity", "Çeşitlilik<br>Farklılık"));
values.push(_createValueItem("dynamism", "Dynamism", "Dinamizm"));
values.push(_createValueItem("economy", "Economy", "Ekonomi"));
values.push(_createValueItem("effectiveness", "Effectiveness", "Etkili Olmak<br>Geçerlilik"));
values.push(_createValueItem("efficiency", "Efficiency", "Verim"));
values.push(_createValueItem("elegance", "Elegance", "Zarafet"));
values.push(_createValueItem("empathy", "Empathy", "Empati"));
values.push(_createValueItem("enjoyment", "Enjoyment", "Hoşlanma<br>Zevk Alma"));
values.push(_createValueItem("enthusiasm", "Enthusiasm", "Coşku - Heyecan"));
values.push(_createValueItem("equality", "Equality", "Eşitlik"));
values.push(_createValueItem("excellence", "Excellence", "Mükemmellik"));
values.push(_createValueItem("excitement", "Excitement", "Heyecan - Coşku"));
values.push(_createValueItem("expertise", "Expertise", "Uzmanlık"));
values.push(_createValueItem("exploration", "Exploration", "Keşif"));
values.push(_createValueItem("expressiveness", "Expressiveness", "Etkileyicilik"));
values.push(_createValueItem("fairness", "Fairness", "Adalet"));
values.push(_createValueItem("faith", "Faith", "İnanç"));
values.push(_createValueItem("family-orientedness", "Family-orientedness", "Aile Odaklığı<br>Aile"));
values.push(_createValueItem("fidelity", "Fidelity", "Doğruluk - Vefa"));
values.push(_createValueItem("fitness", "Fitness", "Sağlık<br>Fit Olmak"));
values.push(_createValueItem("fluency", "Fluency", "Akıcılık"));
values.push(_createValueItem("focus", "Focus", "Odaklanmak"));
values.push(_createValueItem("freedom", "Freedom", "Özgürlük"));
values.push(_createValueItem("fun", "Fun", "Eğlence<br>Eğlenmek"));
values.push(_createValueItem("generosity", "Generosity", "Cömertlik"));
values.push(_createValueItem("goodness", "Goodness", "İyilik"));
values.push(_createValueItem("grace", "Grace", "Lütuf - Zarafet"));
values.push(_createValueItem("growth", "Growth", "Büyüme - Gelişme"));
values.push(_createValueItem("happiness", "Happiness", "Mutluluk"));
values.push(_createValueItem("hard-work", "Hard Work", "Çok Çalışmak"));
values.push(_createValueItem("health", "Health", "Sağlık"));
values.push(_createValueItem("helping-society", "Helping Society", "Topluma Yardım<br>Etmek"));
values.push(_createValueItem("holiness", "Holiness", "Kutsallık"));
values.push(_createValueItem("honesty", "Honesty", "Dürüstlük"));
values.push(_createValueItem("honor", "Honor", "Onur<br>Şeref"));
values.push(_createValueItem("humility", "Humility", "Tevazu<br>Alçakgönüllülük"));
values.push(_createValueItem("independence", "Independence", "Bağımsızlık"));
values.push(_createValueItem("ingenuity", "Ingenuity", "Marifet<br>Yaratıcılık"));
values.push(_createValueItem("inner-harmony", "Inner Harmony", "İç Uyum<br>İç Huzur"));
values.push(_createValueItem("inquisitiveness", "Inquisitiveness", "Meraklılık<br>Çok Soru Sorma"));
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
values.push(_createValueItem("merit", "Merit", "Övgü<br>Övgü Almak"));
values.push(_createValueItem("obedience", "Obedience", "İtaat"));
values.push(_createValueItem("openness", "Openness", "Açıklık"));
values.push(_createValueItem("order", "Order", "Emir Etmek<br>Emir Vermek"));
values.push(_createValueItem("originality", "Originality", "Özgünlük<br>Orjinallik"));
values.push(_createValueItem("patriotism", "Patriotism", "Vatanseverlik"));
values.push(_createValueItem("perfection", "Perfection", "Mükemmellik<br>Kusursuzluk"));
values.push(_createValueItem("piety", "Piety", "Dindarlık"));
values.push(_createValueItem("positivity", "Positivity", "Pozitif Olma<br>Pozitif Bakma"));
values.push(_createValueItem("practicality", "Practicality", "Pratiklik"));
values.push(_createValueItem("preparedness", "Preparedness", "Hazırlıklı Olma<br>Hazır Olma"));
values.push(_createValueItem("professionalism", "Professionalism", "Profesyonellik"));
values.push(_createValueItem("prudence", "Prudence", "İhtiyat<br>Sağduyu"));
values.push(_createValueItem("quality-orientation", "Quality-orientation", "Kalite Odaklılık"));
values.push(_createValueItem("reliability", "Reliability", "Güvenilebilirlik<br>Dayanıklılık"));
values.push(_createValueItem("resourcefulness", "Resourcefulness", "Beceriklilik"));
values.push(_createValueItem("restraint", "Restraint", "Kısıtlama<br>Sınırlandırma"));
values.push(_createValueItem("results-oriented", "Results-oriented", "Sonuç Odaklılık"));
values.push(_createValueItem("rigor", "Rigor", "Titizlik<br>Kesinlik"));
values.push(_createValueItem("security", "Security", "Güvenlik"));
values.push(_createValueItem("self-actualization", "Self-actualization", "Öz Gerçekleştirim"));
values.push(_createValueItem("self-control", "Self-control", "Oto Kontrol"));
values.push(_createValueItem("selflessness", "Selflessness", "Kendinden Çok<br>Başkalarını Düşünme"));
values.push(_createValueItem("self-reliance", "Self-reliance", "Kendine Güven<br>Özgüven"));
values.push(_createValueItem("sensitivity", "Sensitivity", "Duyarlılık<br>Hassaslık"));
values.push(_createValueItem("serenity", "Serenity", "Huzur<br>Sükunet"));
values.push(_createValueItem("service", "Service", "Hizmet Etme"));
values.push(_createValueItem("shrewdness", "Shrewdness", "Zekilik<br>Açık Gözlülük"));
values.push(_createValueItem("simplicity", "Simplicity", "Basitlik"));
values.push(_createValueItem("soundness", "Soundness", "Sağlamlık<br>Esenlik"));
values.push(_createValueItem("speed", "Speed", "Hız"));
values.push(_createValueItem("spontaneity", "Spontaneity", "Doğallık<br>Kendinden Olma"));
values.push(_createValueItem("stability", "Stability", "İstikrar<br>Kararlılık"));
values.push(_createValueItem("strategic", "Strategic", "Stratejik Olma"));
values.push(_createValueItem("strength", "Strength", "Güç - Kuvvet"));
values.push(_createValueItem("structure", "Structure", "Bütün Olarak<br>Düşünmek"));
values.push(_createValueItem("success", "Success", "Başarı"));
values.push(_createValueItem("support", "Support", "Destek"));
values.push(_createValueItem("teamwork", "Teamwork", "Takım Çalışmaso"));
values.push(_createValueItem("temperance", "Temperance", "Ölçülülük<br>Ilımlı Olma"));
values.push(_createValueItem("thankfulness", "Thankfulness", "Şükran - Minnet"));
values.push(_createValueItem("thoroughness", "Thoroughness", "Titizlik<br>Tam Olma"));
values.push(_createValueItem("thoughtfulness", "Thoughtfulness", "Düşüncelilik<br>Özen Gösterme"));
values.push(_createValueItem("timeliness", "Timeliness", "Vakitlilik<br>Dakiklik"));
values.push(_createValueItem("tolerance", "Tolerance", "Hata Payı<br>Toleranslı Olma"));
values.push(_createValueItem("traditionalism", "Traditionalism", "Gelenekselcilik"));
values.push(_createValueItem("trustworthiness", "Trustworthiness", "Güvenilir Olma"));
values.push(_createValueItem("truth-seeking", "Truth-seeking", "Doğruculuk<br>Gerçeği Arama"));
values.push(_createValueItem("understanding", "Understanding", "Anlayış"));
values.push(_createValueItem("uniqueness", "Uniqueness", "Benzersizlik"));
values.push(_createValueItem("unity", "Unity", "Birlik - Bütünlük"));
values.push(_createValueItem("usefulness", "Usefulness", "Kullanışlılık<br>Fayda"));
values.push(_createValueItem("vision", "Vision", "Vizyon"));
values.push(_createValueItem("vitality", "Vitality", "Dirilik<br>Yaşama Gücü"));

const insertionPointSelector = "article > footer";

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

    $insertionPoint.parentNode.insertBefore($rootElement, $insertionPoint);

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

    let $description = document.createElement("div");
    $description.classList.add("notice-box");
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

function _renderCompareTable(data, $rootElement, calculationField, buttonText) {

    let $table = document.createElement("table");
    $table.style.width = "98%";
    $rootElement.appendChild($table);

    let $tableHeader = $table.createTHead();
    let $tableHeaderRow = $tableHeader.insertRow(0);

    let $numericHeaderColumn = $tableHeaderRow.insertCell(0);
    $numericHeaderColumn.outerHTML = "<th>#</th>";
    $numericHeaderColumn.style.textAlign = "center";
    $numericHeaderColumn.style.width = "10%";

    let $tableHeaderFirstColumn = $tableHeaderRow.insertCell(1);
    $tableHeaderFirstColumn.outerHTML = "<th>1. Değer</th>";
    $tableHeaderFirstColumn.style.textAlign = "center";
    $tableHeaderFirstColumn.style.width = "45%";

    let $tableHeaderSecondColumn = $tableHeaderRow.insertCell(2);
    $tableHeaderSecondColumn.outerHTML = "<th>2. Değer</th>";
    $tableHeaderSecondColumn.style.textAlign = "center";
    $tableHeaderSecondColumn.style.width = "45%";

    let $tableBody = $table.createTBody();
    data.forEach(pair => {

        let $tableBodyRow = $tableBody.insertRow($tableBody.rows.length);

        let $numberCell = $tableBodyRow.insertCell(0);
        $numberCell.innerHTML = $tableBody.rows.length;
        $numberCell.style.textAlign = "center";

        let $tableBodyFirstCell = $tableBodyRow.insertCell(1);

        var $firstValueElement = document.createElement("input");
        $firstValueElement.setAttribute("id", pair.xKey);
        $firstValueElement.setAttribute("type", "radio");
        $firstValueElement.setAttribute("name", pair.xKey);
        $firstValueElement.setAttribute("data-key", pair.x.key);
        $tableBodyFirstCell.appendChild($firstValueElement);

        var $firstLabelElement = document.createElement("label");
        $firstLabelElement.setAttribute("for", pair.xKey);
        $firstLabelElement.innerHTML = pair.x.turkish;
        $firstLabelElement.title = pair.x.english;
        $tableBodyFirstCell.appendChild($firstLabelElement);

        let $tableBodySecondCell = $tableBodyRow.insertCell(2);

        var $secondValueElement = document.createElement("input");
        $secondValueElement.setAttribute("id", pair.yKey);
        $secondValueElement.setAttribute("type", "radio");
        $secondValueElement.setAttribute("name", pair.xKey);
        $secondValueElement.setAttribute("data-key", pair.y.key);
        $tableBodySecondCell.appendChild($secondValueElement);

        var $secondLabelElement = document.createElement("label");
        $secondLabelElement.setAttribute("for", pair.yKey);
        $secondLabelElement.innerHTML = pair.y.turkish;
        $secondLabelElement.title = pair.y.english;
        $tableBodySecondCell.appendChild($secondLabelElement);
    });

    var $completeButton = document.createElement("button");
    $completeButton.innerHTML = buttonText;

    let clickHandler = function () {

        let checkedItems = document.querySelectorAll("input[type=radio]:checked");
        if (checkedItems.length !== data.length) {
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

    $completeButton.addEventListener("click", clickHandler);
    $rootElement.appendChild($completeButton);
}

function stepSelection($rootElement) {

    let data = values;

    let $fieldRowGroup = document.createElement("div");
    $fieldRowGroup.classList.add("field-group-row");

    let $table = document.createElement("table");
    $table.style.width = "98%";
    $fieldRowGroup.appendChild($table);

    let $tableBody = $table.createTBody();

    for (let i = 0; i < data.length; i += 2) {
        let value = data[i];

        let $tableRow = $tableBody.insertRow($tableBody.rows.length);

        let $firstCell = $tableRow.insertCell(0);
        var $firstValueElement = document.createElement("input");
        $firstValueElement.setAttribute("id", value.key);
        $firstValueElement.setAttribute("type", "checkbox");
        $firstValueElement.setAttribute("data-key", value.key);
        $firstCell.appendChild($firstValueElement);

        var $firstLabelElement = document.createElement("label");
        $firstLabelElement.setAttribute("for", value.key);
        $firstLabelElement.innerHTML = value.turkish;
        $firstLabelElement.title = value.english;
        $firstCell.appendChild($firstLabelElement);

        value = data[i + 1];
        let $secondCell = $tableRow.insertCell(1);
        var $secondValueElement = document.createElement("input");
        $secondValueElement.setAttribute("id", value.key);
        $secondValueElement.setAttribute("type", "checkbox");
        $secondValueElement.setAttribute("data-key", value.key);
        $secondCell.appendChild($secondValueElement);

        var $secondLabelElement = document.createElement("label");
        $secondLabelElement.setAttribute("for", value.key);
        $secondLabelElement.innerHTML = value.turkish;
        $secondLabelElement.title = value.english;
        $secondCell.appendChild($secondLabelElement);
    }

    var $completeButton = document.createElement("button");
    $completeButton.innerHTML = "Seçimi Tamamla";

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
    $fieldRowGroup.appendChild($completeButton);

    $rootElement.appendChild($fieldRowGroup);

}

function stepFirstCompare($rootElement) {
    let selection = values.filter((item) => {
        if (item.selected) {
            return true;
        }
    });

    let matrix = _createMatrix(selection);
    let data = _shuffle(Object.values(matrix));

    let $fieldRowGroup = document.createElement("div");
    $fieldRowGroup.classList.add("field-group-row");

    _renderCompareTable(data, $fieldRowGroup, "vote", "Karşılaştırmayı Tamamla");

    $rootElement.appendChild($fieldRowGroup);
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

    let $fieldRowGroup = document.createElement("div");
    $fieldRowGroup.classList.add("field-group-row");

    _renderCompareTable(data, $fieldRowGroup, "secondVote", "Değerlendirmeyi Tamamla");

    $rootElement.appendChild($fieldRowGroup);
}

function stepResult($rootElement) {

    let selection = values.filter((item) => {
        if (item.secondVote > 0) {
            return true;
        }
    }).sort((a, b) => {
        return b.result() - a.result();
    });

    let $fieldRowGroup = document.createElement("div");
    $fieldRowGroup.classList.add("field-group-row");

    let $table = document.createElement("table");
    $table.style.width = "98%";
    $fieldRowGroup.appendChild($table);

    let $tableHeader = $table.createTHead();
    let $tableHeaderRow = $tableHeader.insertRow(0);
    let $headerFirstCell = $tableHeaderRow.insertCell(0);
    $headerFirstCell.outerHTML = "<th>#</th>";
    $headerFirstCell.style.textAlign = "center";
    $headerFirstCell.style.width = "10%";

    let $headerSecondCell = $tableHeaderRow.insertCell(1);
    $headerSecondCell.outerHTML = "<th>Değer</th>";
    $headerSecondCell.style.textAlign = "center";
    $headerSecondCell.style.width = "65%";

    let $headerThirdCell = $tableHeaderRow.insertCell(2);
    $headerThirdCell.outerHTML = "<th>Oran (%)</th>";
    $headerThirdCell.style.textAlign = "center";
    $headerThirdCell.style.width = "25%";

    let $tableBody = $table.createTBody();
    for (let i = 0; i < selection.length; i++) {
        const item = selection[i];

        let $tableBodyRow = $tableBody.insertRow($tableBody.rows.length);
        $tableBodyRow.title = item.english;

        let $firstCell = $tableBodyRow.insertCell(0);
        $firstCell.innerHTML = i + 1;
        $firstCell.style.textAlign = "center";

        let $secondCell = $tableBodyRow.insertCell(1);
        $secondCell.innerHTML = item.turkish;
        $secondCell.style.textAlign = "center";

        let $thirdCell = $tableBodyRow.insertCell(2);
        $thirdCell.innerHTML = item.result() * 100;
        $thirdCell.style.textAlign = "center";
    }

    $rootElement.appendChild($fieldRowGroup);
}

window.addEventListener("load", () => {
    _renderSteps();
});