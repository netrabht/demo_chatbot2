document.addEventListener('DOMContentLoaded', () => {
  const chatBox = document.getElementById('chat-box');
  const messageInput = document.getElementById('message-input');
  const sendButton = document.getElementById('send-button');
  let diseaseData = {};
  let insectData = {};

  // Function to add a message to the chat
  function addMessage(content, sender) {
    const message = document.createElement('div');
    message.className = `message ${sender}-message`;
    message.textContent = content;
    chatBox.appendChild(message);
    chatBox.scrollTop = chatBox.scrollHeight; // Scroll to the bottom
  }

  // Function to fetch and parse data from files
  async function loadData() {
    try {
      const [diseaseResponse, insectResponse] = await Promise.all([
        fetch('diseases_full_info.txt'),
        fetch('insects_full_info.txt'),
      ]);

      if (!diseaseResponse.ok || !insectResponse.ok) {
        throw new Error('Error loading files');
      }

      const [diseaseText, insectText] = await Promise.all([
        diseaseResponse.text(),
        insectResponse.text(),
      ]);

      diseaseData = parseFullDiseasesData(diseaseText);
      insectData = parseFullInsectsData(insectText);

      addMessage('ChatBot is ready!', 'bot');
    } catch (error) {
      console.error('Error loading data:', error);
      addMessage('Failed to load data. Please check the files.', 'bot');
    }
  }

  // Parse detailed diseases data
  function parseFullDiseasesData(data) {
    const lines = data.split('\n');
    const result = {};
    let currentVegetable = '';
    let currentDisease = null;

    lines.forEach((line) => {
      if (line.startsWith('Vegetable Name')) {
        currentVegetable = line.split(':')[1].trim();
        result[currentVegetable] = [];
      } else if (line.startsWith('-')) {
        const diseaseName = line.slice(2).trim();
        currentDisease = { name: diseaseName, symptoms: '', management: '' };
        result[currentVegetable].push(currentDisease);
      } else if (line.startsWith('Symptoms')) {
        if (currentDisease) currentDisease.symptoms = line.split(':')[1].trim();
      } else if (line.startsWith('Management Process')) {
        if (currentDisease) currentDisease.management = line.split(':')[1].trim();
      }
    });

    return result;
  }

  // Parse detailed insects data
  function parseFullInsectsData(data) {
    const lines = data.split('\n');
    const result = {};
    let currentVegetable = '';
    let currentInsect = null;

    lines.forEach((line) => {
      if (line.startsWith('Vegetable Name')) {
        currentVegetable = line.split(':')[1].trim();
        result[currentVegetable] = [];
      } else if (line.startsWith('-')) {
        const insectName = line.slice(2).trim();
        currentInsect = { name: insectName, identification: '', management: '' };
        result[currentVegetable].push(currentInsect);
      } else if (line.startsWith('Identification of damages')) {
        if (currentInsect) currentInsect.identification = line.split(':')[1].trim();
      } else if (line.startsWith('Management Method')) {
        if (currentInsect) currentInsect.management = line.split(':')[1].trim();
      }
    });

    return result;
  }

  // Handle user input
  function handleUserInput(input) {
    const userQuery = input.toLowerCase();
    let found = false;

    // Determine query type
    const isDiseaseQuery = userQuery.includes('disease');
    const isInsectQuery = userQuery.includes('insect');

    if (isDiseaseQuery) {
      Object.keys(diseaseData).forEach((vegetable) => {
        if (userQuery.includes(vegetable.toLowerCase())) {
          const diseases = diseaseData[vegetable]
            .map((disease) =>
              `Name: ${disease.name}\nSymptoms: ${disease.symptoms}\nManagement: ${disease.management}`
            )
            .join('\n\n');
          addMessage(`Diseases for ${vegetable}:\n${diseases}`, 'bot');
          found = true;
        }
      });
    }

    if (isInsectQuery) {
      Object.keys(insectData).forEach((vegetable) => {
        if (userQuery.includes(vegetable.toLowerCase())) {
          const insects = insectData[vegetable]
            .map((insect) =>
              `Name: ${insect.name}\nIdentification: ${insect.identification}\nManagement: ${insect.management}`
            )
            .join('\n\n');
          addMessage(`Insects for ${vegetable}:\n${insects}`, 'bot');
          found = true;
        }
      });
    }

    if (!found) {
      addMessage("Sorry, I couldn't find information on that vegetable.", 'bot');
    }
  }

  // Send button event listener
  sendButton.addEventListener('click', () => {
    const userMessage = messageInput.value.trim();
    if (userMessage) {
      addMessage(userMessage, 'user');
      handleUserInput(userMessage);
      messageInput.value = '';
    }
  });

  // Load data on page load
  loadData();
});
