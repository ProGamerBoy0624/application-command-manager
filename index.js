let optionIndex = 0;

function addOption() {
    const container = document.getElementById('optionsContainer');

    const div = document.createElement('div');
    div.className = 'option';
    div.dataset.index = optionIndex;
    div.innerHTML = `
    <h3>Option</h3>
    <input type="text" name="optionName" placeholder="Option Name" required>
    <input type="text" name="optionDescription" placeholder="Option Description" required>
    <select name="optionType">
        <option value="" disabled selected>Option Type</option>
        <option value="1">SUB_COMMAND</option>
        <option value="2">SUB_COMMAND_GROUP</option>
        <option value="3">STRING</option>
        <option value="4">INTEGER</option>
        <option value="5">BOOLEAN</option>
        <option value="6">USER</option>
        <option value="7">CHANNEL</option>
        <option value="8">ROLE</option>
        <option value="9">MENTIONABLE</option>
        <option value="10">NUMBER</option>
        <option value="11">ATTACHMENT</option>
    </select>
    <select name="isRequired">
        <option value="" disabled selected>Is Required?</option>
        <option value="true">Yes</option>
        <option value="false">No</option>
    </select>
    <div class="choices"></div>
    <button type="button" onclick="addChoice(this)">➕ Add Choice</button>
    <button type="button" class="remove" onclick="this.parentElement.remove()">❌ Remove Option</button>
    `;
    container.appendChild(div);
    optionIndex++;
}

function addChoice(button) {
    const container = button.previousElementSibling;
    const div = document.createElement('div');
    div.className = 'choice';
    div.innerHTML = `
    <input type="text" name="choiceName" placeholder="Choice Name" required>
    <input type="text" name="choiceValue" placeholder="Choice Value" required>
    <button type="button" class="remove" onclick="this.parentElement.remove()">❌ Remove Choice</button>
    `;
    container.appendChild(div);
}

function buildCommandJSON() {
    const name = document.getElementById('commandName').value.trim();
    const desc = document.getElementById('commandDescription').value.trim();
    const isAdmin = document.getElementById('adminPermission').value === "1";

    const options = [];
    document.querySelectorAll('#optionsContainer .option').forEach(opt => {
    const optionName = opt.querySelector('[name="optionName"]').value.trim();
    const optionDesc = opt.querySelector('[name="optionDescription"]').value.trim();
    const optionType = parseInt(opt.querySelector('[name="optionType"]').value);
    const isRequired = opt.querySelector('[name="isRequired"]').value === "true";

    const option = {
        name: optionName,
        description: optionDesc,
        type: optionType,
        required: isRequired,
    };

    const choices = [];
    opt.querySelectorAll('.choice').forEach(choiceEl => {
        const name = choiceEl.querySelector('[name="choiceName"]').value.trim();
        const value = choiceEl.querySelector('[name="choiceValue"]').value.trim();
        choices.push({ name, value });
    });

    if (choices.length > 0) {
        option.choices = choices;
    }

    options.push(option);
    });

    return JSON.stringify({
    name,
    description: desc,
    type: 1,
    options,
    ...(isAdmin && { default_member_permissions: "0" })
    }, null, 2);
}

function createJSON() {
    const preview = document.getElementById('jsonPreview');
    const json = buildCommandJSON();
    preview.style.display = 'block';
    preview.innerText = json;
}

document.getElementById('commandForm').addEventListener('submit', async (e) => {
    e.preventDefault();

    const token = document.getElementById('botToken').value.trim();
    const appID = document.getElementById('applicationID').value.trim();
    const name = document.getElementById('commandName').value.trim();
    const isDelete = document.getElementById('deleteCommand').value === "1";

    const jsonBody = buildCommandJSON();
    const url = isDelete
    ? `https://discord.com/api/v10/applications/${appID}/commands/${name}`
    : `https://discord.com/api/v10/applications/${appID}/commands`;

    const method = isDelete ? "DELETE" : "POST";

    const res = await fetch(url, {
    method,
    headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bot ${token}`
    },
    body: isDelete ? null : jsonBody
    });

    const data = await res.json();
    const preview = document.getElementById('jsonPreview');
    preview.style.display = 'block';
    preview.innerText = JSON.stringify(data, null, 2);
});