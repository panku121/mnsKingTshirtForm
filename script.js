const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzcgguEO4kF6u68tlDZsBf6f8Sj7Z0cpHFcQU6fSeRRlaHk0mhyav9De4EVIJUla_o0CA/exec";

const form = document.getElementById("mnsKingsForm");
const submitBtn = document.getElementById("submitBtn");
const statusMessage = document.getElementById("statusMessage");
const playerNameInput = document.getElementById("playerName");
const phoneNumberInput = document.getElementById("phoneNumber");
const nameOnTshirtInput = document.getElementById("nameOnTshirt");
const numberOnBackInput = document.getElementById("numberOnBack");

function setFieldError(fieldId, message) {
    document.getElementById(fieldId + "Error").textContent = message;
}

function clearAllErrors() {
    const errorNodes = form.querySelectorAll(".error");
    errorNodes.forEach(function (node) {
        node.textContent = "";
    });
    statusMessage.textContent = "";
    statusMessage.className = "status";
}

function validateForm(data) {
    clearAllErrors();
    let isValid = true;

    if (!/^[A-Za-z ]{2,50}$/.test(data.playerName.trim())) {
        setFieldError("playerName", "Please enter a valid player name.");
        isValid = false;
    }

    if (!/^[0-9]{10}$/.test(data.phoneNumber.trim())) {
        setFieldError("phoneNumber", "Phone number must be exactly 10 digits.");
        isValid = false;
    }

    if (!/^[A-Za-z0-9 ]{2,15}$/.test(data.nameOnTshirt.trim())) {
        setFieldError("nameOnTshirt", "Use 2-15 characters (letters/numbers only).");
        isValid = false;
    }

    if (!data.tshirtSize) {
        setFieldError("tshirtSize", "Please select T-Shirt size.");
        isValid = false;
    }

    if (!/^\d{1,3}$/.test(data.numberOnBack.trim())) {
        setFieldError("numberOnBack", "Back number me 1-3 digits dalo (example: 001, 07, 700).");
        isValid = false;
    }

    if (!data.sleeveLength) {
        setFieldError("sleeveLength", "Please select sleeve length.");
        isValid = false;
    }

    return isValid;
}

async function saveToGoogleSheet(data) {
    const payload = new FormData();
    Object.keys(data).forEach(function (key) {
        payload.append(key, data[key]);
    });

    let response;
    try {
        response = await fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            body: payload
        });
    } catch (networkError) {
        throw new Error("Network/CORS error: Web App deployment access is not public.");
    }

    if (!response.ok) {
        if (response.status === 401 || response.status === 403) {
            throw new Error("Unauthorized: Google Apps Script deployment access is restricted.");
        }
        throw new Error("Failed to save data. Status: " + response.status);
    }

    return response.text();
}

async function handleFormSubmit(event) {
    event.preventDefault();

    const formData = {
        playerName: document.getElementById("playerName").value,
        phoneNumber: document.getElementById("phoneNumber").value,
        nameOnTshirt: document.getElementById("nameOnTshirt").value.toUpperCase(),
        tshirtSize: document.getElementById("tshirtSize").value,
        numberOnBack: document.getElementById("numberOnBack").value,
        sleeveLength: document.getElementById("sleeveLength").value
    };

    if (!validateForm(formData)) {
        statusMessage.textContent = "Please fix highlighted fields.";
        statusMessage.classList.add("error");
        return;
    }

    submitBtn.disabled = true;
    submitBtn.textContent = "Saving...";

    try {
        await saveToGoogleSheet(formData);
        statusMessage.textContent = "Thanks " + formData.playerName.trim() + ", aapki T-shirt request Team Captain Manish k pass receive ho gayi hai.";
        statusMessage.className = "status success";
        setTimeout(function () {
            form.reset();
            clearAllErrors();
        }, 5000);
    } catch (error) {
        if (error.message.includes("Unauthorized")) {
            statusMessage.textContent = "Access issue: Apps Script deployment me 'Anyone with link' set karo.";
        } else if (error.message.includes("Network/CORS")) {
            statusMessage.textContent = "CORS/Access issue: deployment public nahi hai ya URL galat hai.";
        } else {
            statusMessage.textContent = "Error saving entry. Please try again.";
        }
        statusMessage.className = "status error";
    } finally {
        submitBtn.disabled = false;
        submitBtn.textContent = "Submit Entry";
    }
}

form.addEventListener("submit", handleFormSubmit);

playerNameInput.addEventListener("input", function () {
    this.value = this.value.replace(/[^A-Za-z ]/g, "");
});

phoneNumberInput.addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "").slice(0, 10);
});

nameOnTshirtInput.addEventListener("input", function () {
    this.value = this.value.toUpperCase();
});

numberOnBackInput.addEventListener("input", function () {
    this.value = this.value.replace(/\D/g, "").slice(0, 3);
});
