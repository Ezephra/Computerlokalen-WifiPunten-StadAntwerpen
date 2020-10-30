const contactForm = document.getElementById("contactForm");
const requiredName = document.getElementById('required-name');
const requiredEmail = document.getElementById('required-email');
const requiredSubject = document.getElementById('required-subject');
const textArea = document.getElementById('input-textarea');
const termsCondition = document.getElementById("checkbox1");
const tokenSMTP = '13b27463-230b-4fd9-a63f-2770cbc8f39e';
termsCondition.disabled = true;

contactForm.addEventListener('input', (e) => {
    if (requiredName.value.length == 0 || requiredEmail.value.length == 0 || requiredSubject.value.length == 0 || textArea.value.length == 0) {
        termsCondition.disabled = true;
    } else {
        termsCondition.disabled = false;
    }
})

contactForm.addEventListener('submit', (e) => {
    //e.preventDefault();
})
