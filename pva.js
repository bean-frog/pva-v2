/********************* 
 * PVA V2 by Graeme Kieran
 * Was this really a good idea? who knows
 * anyway this is the js file with all the PVA logic and stuff
 * (c) 2023 Graeme Kieran etc etc nerd shit but like it still applies so pay attention
 *********************/
document.addEventListener('DOMContentLoaded', function() {
    if (!localStorage.getItem('pva-v2-settings')) {
        let settingsJsonStruct = `{
            "minOn":null,
            "minOff":null,
            "breakAfter":null,
            "compactTasks":false,
            "intensity":"low",
            "sound":"alarmclock"
        }`
        localStorage.setItem('pva-v2-settings', settingsJsonStruct)
    }
})
//vv settings vv
function updateSettingsItem(key, newVal) { //updates a given key in the settings JSON in local storage
    const storageKey = 'pva-v2-settings';
    let storedData = localStorage.getItem(storageKey);
    if (storedData) {
        try {
            let dataObject = JSON.parse(storedData);
            if (dataObject.hasOwnProperty(key)) {
                dataObject[key] = newVal;
            } else {
                dataObject[key] = newVal;
            }
            localStorage.setItem(storageKey, JSON.stringify(dataObject));
        } catch (error) {
            console.error('Error parsing JSON from Local Storage:', error);
        }
    } else {
        const newData = {
            [key]: newVal
        };
        localStorage.setItem(storageKey, JSON.stringify(newData));
    }
}
//^^ settings ^^
//vv timer vv
function setTimer(min, callback) { //sets the PVA timer interval as well as the clock indicator 
    let cdElement = document.querySelector(".countdown");
    if (cdElement) {
        cdElement.innerHTML = `
            <span style="--value:0;"></span>:
            <span style="--value:0;"></span>:
            <span style="--value:0;"></span>
        `;
        let hoursElement = cdElement.querySelector("span:nth-of-type(1)");
        let minutesElement = cdElement.querySelector("span:nth-of-type(2)");
        let secondsElement = cdElement.querySelector("span:nth-of-type(3)");
        let totalSeconds = min * 60;

        function updateTimer() {
            let hours = Math.floor(totalSeconds / 3600);
            let minutes = Math.floor((totalSeconds % 3600) / 60);
            let seconds = totalSeconds % 60;
            hoursElement.style.setProperty('--value', hours);
            minutesElement.style.setProperty('--value', minutes);
            secondsElement.style.setProperty('--value', seconds);

            if (totalSeconds <= 0) {
                clearInterval(intervalId);
                if (typeof callback === 'function') {
                    callback();
                }
            } else {
                totalSeconds--;
            }
        }

        updateTimer();
        let intervalId = setInterval(updateTimer, 1000);
    } else {
        console.log('Countdown element not found.');
    }
}
function clearTimer() { //DOES NOT WORK clears the timer (fix soon :( maybe)
    let cdElement = document.querySelector(".countdown");
    if (cdElement) {
        cdElement.innerHTML = `
            <span style="--value:0;">0</span>:
            <span style="--value:0;">0</span>:
            <span style="--value:0;">0</span>
        `;
    }
    clearInterval(intervalId);
}
function timerCycle(min1, min2, breakAfter, count = 0) { //cycles the timer instead of just once, used for study cycles
    if (count < breakAfter) {
        setTimer(min1, function() {
            pvaAlert();
            setTimer(min2, function() {
                pvaAlert('endbreak', JSON.parse(localStorage.getItem('pva-v2-settings')).intensity);
                timerCycle(min1, min2, breakAfter, count + 1);
            });
        });
    }
}
document.getElementById('customStart').addEventListener('click', function() { //starts a timer based on custom values
    let min1 = document.getElementById('minOn').value;
    let min2 = document.getElementById('minOff').value;
    let breakAfter = document.getElementById('breakAfter').value;
    if (!min1 || !min2 || !breakAfter) {
        alert('must have all 3 values (min on, min off, times)')
    } else {
       timerCycle(min1, min2, breakAfter) 
    }
    
})
//ensure the user doesnt input too high or low of a value
//(also saves the value to LS)
//add the '.regulate-size' class to any number input 
const numberInputs = document.getElementsByClassName('regulate-size');
Array.from(numberInputs).forEach(numberInput => {
    numberInput.addEventListener('change', function() {
        const maxValue = parseFloat(numberInput.max);
        if (parseFloat(numberInput.value) > maxValue) {
            numberInput.value = maxValue;
        };
        if (parseFloat(numberInput.value) < 0.1) {
            numberInput.value = 0.1;
        }
        switch (numberInput.getAttribute("id")) {
            case "minOn":
                updateSettingsItem('minOn', numberInput.value)
                break;
            case "minOff":
                updateSettingsItem('minOff', numberInput.value)
                break;
            case "breakAfter":
                updateSettingsItem('breakAfter', numberInput.value)
                break;

            default:
                break;
        }
    });
});

document.addEventListener('DOMContentLoaded', function() {//auto-populate inputs on load
    if (localStorage.getItem('pva-v2-settings')) {
    if (JSON.parse(localStorage.getItem('pva-v2-settings')).minOn) {
        document.getElementById('minOn').value = JSON.parse(localStorage.getItem('pva-v2-settings')).minOn
    };
    if (JSON.parse(localStorage.getItem('pva-v2-settings')).minOff) {
        document.getElementById('minOff').value = JSON.parse(localStorage.getItem('pva-v2-settings')).minOff
    };
    if (JSON.parse(localStorage.getItem('pva-v2-settings')).breakAfter) {
        document.getElementById('breakAfter').value = JSON.parse(localStorage.getItem('pva-v2-settings')).breakAfter
    };
} 
});
/*
function setBlockDisplay(which) {
    let display = document.getElementById('blockDisplay');
    switch (which) {
        case "work":
            display.textContent = "Work";
            break;
        case "break":
            display.textContent = "Break";
        default:
            display.textContent = "";
            break;
    }
}
function switchBlockDisplay() {
    let display = document.getElementById('blockDisplay');
    switch (display.textContent) {
        case "Work":
            display.textContent = "Break";
            break;
        case "Break":
            display.textContent = "Work";
            break;
        default:
            break;
    }
}
*/
//^^ timer ^^
//vv alert vv
function pvaAlert(type, intensity) {
playSound('assets/sound/' + document.getElementById('soundchoice').value + '.mp3');
    switch (type) {
        case "endbreak":
            const messages = {
                low: "Hey there lazy, get back to work NOW. I won't ask again.",
                mid: "your break is over you piece of shit, get back to work or you'll be a disgrace to your whole fucking family.",
                high: "HEY- light's not getting any greener, well actually that doesn't really make sense I guess what i mean is YOUR BREAK IS OVER get the fuck back to work you lazy ass potato. I can tell you're thinking of slacking off again aren't you you little shit. BACK TO WORK",
                nuclear: "If you don't get back to doing your work right now I'll have you shipped off to the DRC and you can be a slave in the fucking cobalt mines. sounds pretty shitty, right? yeah that's what I fucking thought now get back to work. your break is over, get off of youtube. If you don't press okay on this message within 10 seconds, I'm gonna open a few pornhub tabs just so your parents know how much of a disgrace your lazy ass is. "
            };
            var msg;
            var timer;
            var timerbar;
            switch (intensity) {
                case "low":
                    msg = messages.low;
                    timer = null;
                    timerbar = false;
                    break;
                case "mid":
                    msg = messages.mid;
                    timer = null;
                    timerbar = false;
                    break;
                case "high":
                    msg = messages.high;
                    timer = null;
                    timerbar = false;
                    break;
                case "nuclear":
                    msg = messages.nuclear;
                    timer = 15000;
                    timerbar = true
                    var punishment = setTimeout(function() {
                        for (let i = 0; i < 10; i++) {
                            let a = document.createElement('a');
                            a.setAttribute('target', "_blank");
                            a.href = "https://cornhub.website";
                            a.click();
                        }
                    }, 15000)
                    break;
                default:
                    msg = 'invalid intensity value recieved. (break is over btw)'
                    break;
            }
            Swal.fire({
                title: "BREAK'S OVER BOZO",
                text: msg,
                icon: 'warning',
                timer: timer,
                timerProgressBar: timerbar,
                showCancelButton: false,
                allowOutsideClick: false,
                allowEscapeKey: false
            }).then((result) => {
                if (result.isConfirmed) {
                    console.log('OK button was clicked!');
                    if (punishment) {
                        clearTimeout(punishment)
                    }
                }
            });
            break;
        default:
            Swal.fire({
                title: "Study block is over!",
                text: "you better have actually gotten some work done, or I'm coming for you",
                icon: 'success',
                showCancelButton: false,
                allowOutsideClick: false,
                allowEscapeKey: false
            }).then((result) => {
                if (result.isConfirmed) {
                    console.log('OK button was clicked!');
                }
            });
            break;
    }
}
//^^ alert ^^
//vv tasks vv
let tasksContainer = document.getElementById('tasksContainer');
async function addTask() {
    const {
        value: formValues
    } = await Swal.fire({
        title: 'New Task',
        html: '<input id="swal-input1" class="text-black swal2-input" placeholder="Task Title">' +
            '<input id="swal-input2" class="text-black swal2-input" placeholder="Task Description">',
        focusConfirm: false,
        preConfirm: () => {
            const input1 = document.getElementById('swal-input1').value;
            const input2 = document.getElementById('swal-input2').value;
            if (input1.trim() === '' || input2.trim() === '') {
                Swal.showValidationMessage('Both inputs are required');
                return false;
            }
            return [input1, input2];
        }
    });
    if (formValues) {
        let tasks = localStorage.getItem('tasks');
        tasks = tasks ? JSON.parse(tasks) : {};
        const taskId = Object.keys(tasks).length + 1;
        const newTask = {
            title: formValues[0],
            desc: formValues[1],
            complete: false
        };
        tasks[taskId] = newTask;
        localStorage.setItem('tasks', JSON.stringify(tasks));
        let template = `
            <div class="p-4 m-2 bg-white rounded-lg shadow-md" data-task-id="${taskId}">
                <div class="flex flex-row">
                    <input type="checkbox" class="mr-4 checkbox" onchange="toggleTaskCompletion(this)">
                    <button class="p-2 pt-0 pl-0" onclick="removeTask(${taskId})"><i class="text-red-600 fas fa-trash"></i></button>
                    <h3 class="mb-2 text-lg font-bold">${formValues[0]}</h3>
                </div>
                <p class="break-words">${formValues[1]}</p>
            </div>
        `;
        let compactTemplate = `
        <div class="p-2 m-2 bg-white rounded-lg shadow-md"data-task-id="${taskId}">
        <div class="flex flex-row items-center">
            <input id="cbox-${taskId}" type="checkbox" class="mr-2 checkbox" onchange="toggleTaskCompletion(this)">
            <button class="self-center pr-2" onclick="removeTask(${taskId})"><i class="text-red-600 fas fa-trash"></i></button>
            <h3 class="self-center text-lg font-bold">${tasks[taskId].title}</h3>
            <p class="self-center ml-2">${tasks[taskId].desc}</p>
        </div>
        </div>
        `
        let checkForCompact = JSON.parse(localStorage.getItem('pva-v2-settings')).compactTasks;
        switch (checkForCompact) {
            case true:
                tasksContainer.insertAdjacentHTML('beforeend', compactTemplate);
                break;
            case false:
                tasksContainer.insertAdjacentHTML('beforeend', template);
                break;
        
            default:
                break;
        }
    }
}

window.onload = function() {
    let ct = JSON.parse(localStorage.getItem('pva-v2-settings')).compactTasks;
    if (tasksContainer) {
        if (ct == true) {
            reloadTasksCompact();
            document.getElementById('compactToggle').click()
        } else if (ct == false) {
            loadTasks();
        }
    } else {

        let checkForEl = setInterval(function() {
            if (tasksContainer) {
                if (ct = true) {
                    reloadTasksCompact();
                    document.getElementById('compactToggle').click()
                } else if (ct = false) {
                    loadTasks();
                }
                clearInterval(checkForEl);
                return;
            }
        }, 10)
    };

};

function loadTasks() {
    const tasksContainer = document.getElementById('tasksContainer'); //redundant?
    let tasks = localStorage.getItem('tasks');
    tasks = tasks ? JSON.parse(tasks) : {};

    for (const taskId in tasks) {
        let template = `
            <div class="p-4 m-2 bg-white rounded-lg shadow-md" data-task-id="${taskId}">
                <div class="flex flex-row">
                    <input id="cbox-${taskId}" type="checkbox" class="mr-4 checkbox" onchange="toggleTaskCompletion(this)">
                    <button class="p-2 pt-0 pl-0" onclick="removeTask(${taskId})"><i class="text-red-600 fas fa-trash"></i></button>
                    <h3 class="mb-2 text-lg font-bold">${tasks[taskId].title}</h3>
                </div>
                <p class="break-words">${tasks[taskId].desc}</p>
            </div>
        `;
        tasksContainer.insertAdjacentHTML('beforeend', template);
        let cboxID = document.getElementById(`cbox-${taskId}`)
        if (tasks[taskId].complete == true) {
            cboxID.click()
        }
    }
}

function reloadTasksCompact() {
    let tasks = localStorage.getItem('tasks');
    tasks = tasks ? JSON.parse(tasks) : {};

    for (const taskId in tasks) {
        let template = `
        <div class="p-2 m-2 bg-white rounded-lg shadow-md"data-task-id="${taskId}">
        <div class="flex flex-row items-center">
            <input id="cbox-${taskId}" type="checkbox" class="mr-2 checkbox" onchange="toggleTaskCompletion(this)">
            <button class="self-center pr-2" onclick="removeTask(${taskId})"><i class="text-red-600 fas fa-trash"></i></button>
            <h3 class="self-center text-lg font-bold">${tasks[taskId].title}</h3>
            <p class="self-center ml-2">${tasks[taskId].desc}</p>
        </div>
    </div>
        `;
        tasksContainer.insertAdjacentHTML('beforeend', template);
        let cboxID = document.getElementById(`cbox-${taskId}`)
        if (tasks[taskId].complete == true) {
            cboxID.click()
        }
    }
}

function removeTask(taskId) {
    let tasks = localStorage.getItem('tasks');
    tasks = tasks ? JSON.parse(tasks) : {};
    delete tasks[taskId];
    localStorage.setItem('tasks', JSON.stringify(tasks));

    const taskElement = document.querySelector(`[data-task-id="${taskId}"]`);
    taskElement.remove();
}

function toggleTaskCompletion(checkbox) {
    const taskElement = checkbox.parentElement.parentElement;
    if (checkbox.checked) {
        taskElement.classList.add('bg-emerald-200');
        taskElement.classList.remove('bg-white');
        let taskId = checkbox.id.replace(/cbox-/g, '');
        let tasks = localStorage.getItem('tasks');
        tasks = tasks ? JSON.parse(tasks) : {};
        tasks[taskId].complete = true;
        localStorage.setItem('tasks', JSON.stringify(tasks));


    } else {
        taskElement.classList.remove('bg-emerald-200');
        taskElement.classList.add('bg-white');
    }
}
document.getElementById('compactToggle').addEventListener('click', function() {
    if (this.checked) {
        tasksContainer.innerHTML = ``;
        updateSettingsItem('compactTasks', true);
        reloadTasksCompact()
    } else if (!this.checked) {
        tasksContainer.innerHTML = ``;
        updateSettingsItem('compactTasks', false);
        loadTasks();
    }
})
//^^ tasks ^^
//vv sound vv
function playSound(path) {
    let soundEl = document.getElementById('pva-sound');
    if (!soundEl) {
        let pvaSound = document.createElement('audio');
        pvaSound.setAttribute('autoplay', true);
        pvaSound.setAttribute('id', 'pva-sound');
        pvaSound.setAttribute('src', path);
        document.body.appendChild(pvaSound);
        pvaSound.play();
    } else {
        soundEl.pause();
        soundEl.setAttribute('src', path);
        soundEl.play();
    }
}
document.getElementById('soundchoice').addEventListener('change', function() {
updateSettingsItem('sound', this.value);
});
document.addEventListener('DOMContentLoaded', function() {
document.getElementById('soundchoice').value = JSON.parse(localStorage.getItem('pva-v2-settings')).sound
});
document.getElementById('preview').addEventListener('click', function(){
var path = 'assets/sound/' + document.getElementById('soundchoice').value + '.mp3';
console.log(path);
playSound(path)
});
//^^ sound ^^
//vv intensity vv
document.addEventListener('DOMContentLoaded', function() {
    let savedIntensity = JSON.parse(localStorage.getItem('pva-v2-settings')).intensity;
    let def = document.getElementById('intensityDef');
    let radios = document.getElementById('intensitySel').getElementsByTagName('input');
    radios = Array.from(radios);
    switch (savedIntensity) {
        case "low":
            radios[0].checked = true;
            def.innerHTML = `<span class="font-bold">Low</span>: a very mild push in the right direction. Not harsh at all, just firm. No explicit language.`;
            break;
        case "mid":
            radios[1].checked = true;
            def.innerHTML = `<span class="font-bold">Mid</span>: a bit of a step up with some spice. Explicit language.`;
            break;
        case "high":
            radios[2].checked = true;
            def.innerHTML = `<span class="font-bold">High</span>: you guessed it, even stronger than the last one, also contains explicit language.`;
            break;

        case "nuclear":
            radios[3].checked = true;
            def.innerHTML = `<span class='font-bold'>Nuclear</span>: not only does this abomination contain even more explicit language, there's also a little surprise if you dont get back to work on time.....`;
            break;
        default:
            radios[0].checked = true;
            def.innerHTML = '<span class="font-bold">Low</span>: a very mild push in the right direction. Not harsh at all, just firm. No explicit language.';

            break;
    }
    radios.forEach(radio => {
        radio.addEventListener('input', function() {
            switch (this.value) {
                case 'low':
                    def.innerHTML = '<span class="font-bold">Low</span>: a very mild push in the right direction. Not harsh at all, just firm. No explicit language.';
                    updateSettingsItem('intensity', 'low');
                    break;
                case 'mid':
                    def.innerHTML = '<span class="font-bold">Mid</span>: a bit of a step up with some spice. Explicit language.'
                    updateSettingsItem('intensity', 'mid');
                    break;

                case 'high':
                    def.innerHTML = '<span class="font-bold">High</span>: you guessed it, even stronger than the last one, also contains explicit language.'
                    updateSettingsItem('intensity', 'high');
                    break;

                case 'nuclear':
                    def.innerHTML = "<span class='font-bold'>Nuclear</span>: not only does this abomination contain even more explicit language, there's also a little surprise if you dont get back to work on time....."
                    updateSettingsItem('intensity', 'nuclear');
                    break;

                default:
                    break;
            }
        })
    });
})
//^^ intensity ^^ 