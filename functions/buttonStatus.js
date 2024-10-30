let isButtonDisabled = false;

function getButtonStatus() {
    return isButtonDisabled;
}

function toggleButtonStatus() {
    isButtonDisabled = !isButtonDisabled;
}

module.exports = {
    getButtonStatus,
    toggleButtonStatus,
};
