const bcrypt = require('bcryptjs');

async function generateHash() {
  const password = '#@Pg21pa';
  try {
    const hashedPassword = await bcrypt.hash(password, 10);
    console.log('Generated hash:', hashedPassword);
  } catch (error) {
    console.error('Hash generation error:', error);
  }
}

generateHash();