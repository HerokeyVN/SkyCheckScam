const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { spawn } = require('child_process');

// Create readline interface for user input
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Path to the main data file
const dataPath = path.join(__dirname, 'scammers_data.json');

// Function to load existing data
function loadExistingData() {
  try {
    const rawData = fs.readFileSync(dataPath);
    return JSON.parse(rawData);
  } catch (error) {
    console.log('No existing data file found. Creating a new one.');
    return { data: [] };
  }
}

// Function to save data
function saveData(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
  console.log('Data saved successfully.');
}

// Function to generate a new ID
function generateNewId(existingData) {
  if (!existingData.data || existingData.data.length === 0) {
    return 1;
  }
  
  // Find the maximum ID and increment by 1
  const maxId = Math.max(...existingData.data.map(item => parseInt(item.id)));
  return maxId + 1;
}

// Function to add a new scammer
async function addNewScammer(existingData) {
  const newScammer = {
    id: generateNewId(existingData).toString(),
    fbName: '',
    realName: '',
    phone: '',
    mail: '',
    bank: [],
    fbUID: [],
    linkWarn: ''
  };

  console.log('\n=== Adding New Scammer Entry ===');
  
  // Helper function to prompt for input
  const promptInput = (question) => {
    return new Promise((resolve) => {
      rl.question(question, (answer) => {
        resolve(answer.trim());
      });
    });
  };

  // Ask for basic information
  newScammer.fbName = await promptInput('Enter Facebook Name: ');
  newScammer.realName = await promptInput('Enter Real Name (or press enter to skip): ');
  newScammer.phone = await promptInput('Enter Phone Number (or press enter to skip): ');
  newScammer.mail = await promptInput('Enter Email (or press enter to skip): ');
  
  // Ask for bank information
  let addMoreBanks = await promptInput('Do you want to add bank information? (y/n): ');
  while (addMoreBanks.toLowerCase() === 'y') {
    const bankInfo = {};
    bankInfo.bankName = await promptInput('Enter Bank Name: ');
    bankInfo.bankNumber = await promptInput('Enter Bank Number: ');
    bankInfo.name = await promptInput('Enter Account Holder Name: ');
    
    newScammer.bank.push(bankInfo);
    
    addMoreBanks = await promptInput('Add another bank account? (y/n): ');
  }
  
  // Ask for Facebook UIDs
  let addMoreUIDs = await promptInput('Do you want to add Facebook UIDs? (y/n): ');
  while (addMoreUIDs.toLowerCase() === 'y') {
    const uid = await promptInput('Enter Facebook UID: ');
    if (uid) {
      newScammer.fbUID.push(uid);
    }
    
    addMoreUIDs = await promptInput('Add another UID? (y/n): ');
  }
  
  // Ask for warning links
  newScammer.linkWarn = await promptInput('Enter Warning Links (separate multiple links with newlines):\n');
  
  // Confirm addition
  console.log('\n=== New Scammer Information ===');
  console.log(JSON.stringify(newScammer, null, 2));
  
  const confirm = await promptInput('\nAdd this scammer to the database? (y/n): ');
  
  if (confirm.toLowerCase() === 'y') {
    existingData.data.push(newScammer);
    saveData(existingData);
    return true;
  } else {
    console.log('Scammer not added.');
    return false;
  }
}

// Function to run the split data script
function runSplitDataScript() {
  return new Promise((resolve, reject) => {
    const splitScript = spawn('node', ['split_data.js']);
    
    splitScript.stdout.on('data', (data) => {
      console.log(`${data}`);
    });
    
    splitScript.stderr.on('data', (data) => {
      console.error(`Error: ${data}`);
    });
    
    splitScript.on('close', (code) => {
      if (code === 0) {
        console.log('Split data process completed successfully.');
        resolve();
      } else {
        console.error(`Split data process exited with code ${code}`);
        reject();
      }
    });
  });
}

// Main function
async function main() {
  try {
    console.log('Loading existing data...');
    const existingData = loadExistingData();
    console.log(`Loaded ${existingData.data?.length || 0} existing scammer entries.`);
    
    let addAnother = true;
    
    while (addAnother) {
      const added = await addNewScammer(existingData);
      
      if (added) {
        const answer = await new Promise((resolve) => {
          rl.question('Do you want to add another scammer? (y/n): ', (ans) => {
            resolve(ans.trim().toLowerCase());
          });
        });
        
        addAnother = (answer === 'y');
      } else {
        const answer = await new Promise((resolve) => {
          rl.question('Do you want to try again? (y/n): ', (ans) => {
            resolve(ans.trim().toLowerCase());
          });
        });
        
        addAnother = (answer === 'y');
      }
    }
    
    // Ask to run the split data script
    const shouldSplit = await new Promise((resolve) => {
      rl.question('Do you want to update the split data files? (y/n): ', (ans) => {
        resolve(ans.trim().toLowerCase() === 'y');
      });
    });
    
    if (shouldSplit) {
      console.log('Running split data script...');
      await runSplitDataScript();
    }
    
    console.log('Process completed. Goodbye!');
    rl.close();
    
  } catch (error) {
    console.error('An error occurred:', error);
    rl.close();
  }
}

// Start the program
main();
