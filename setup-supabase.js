const fs = require('fs');
const readline = require('readline');
const path = require('path');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Function to prompt for input
const prompt = (question) => new Promise((resolve) => {
  rl.question(question, (answer) => resolve(answer));
});

async function setupSupabase() {
  console.log('Supabase Configuration Setup');
  console.log('----------------------------');
  console.log('Please enter your Supabase project details:');
  
  const supabaseUrl = await prompt('Supabase URL (e.g., https://your-project-id.supabase.co): ');
  const supabaseAnonKey = await prompt('Supabase Anon Key: ');
  
  // Update .env file
  const envPath = path.join(__dirname, '.env');
  const envContent = `# Supabase credentials
REACT_APP_SUPABASE_URL=${supabaseUrl}
REACT_APP_SUPABASE_ANON_KEY=${supabaseAnonKey}
`;
  
  fs.writeFileSync(envPath, envContent);
  console.log('\n.env file updated successfully!');
  
  // Update supabase/config.json
  const configDir = path.join(__dirname, 'supabase');
  if (!fs.existsSync(configDir)) {
    fs.mkdirSync(configDir, { recursive: true });
  }
  
  const projectId = supabaseUrl.replace('https://', '').replace('.supabase.co', '');
  const configPath = path.join(configDir, 'config.json');
  const configContent = {
    project_id: projectId,
    api: {
      url: supabaseUrl,
      key: supabaseAnonKey
    }
  };
  
  fs.writeFileSync(configPath, JSON.stringify(configContent, null, 2));
  console.log('supabase/config.json updated successfully!');
  
  console.log('\nSupabase configuration complete!');
  console.log('You can now start your application with: npm start');
  
  rl.close();
}

setupSupabase().catch(err => {
  console.error('Error setting up Supabase configuration:', err);
  rl.close();
});
