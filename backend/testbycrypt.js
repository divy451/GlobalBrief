const bcrypt = require('bcryptjs');

async function testBcrypt() {
  const password = '#@Pg21pa';
  const storedHash = '$2b$10$2gtgSkDJClA61.DwKWOVUOJYUJoZrTsTYUhYI3hXlRCdf/PQDZCUK';
  try {
    const isMatch = await bcrypt.compare(password, storedHash);
    console.log('Password match:', isMatch);
    if (isMatch) {
      console.log('bcryptjs is working correctly');
    } else {
      console.log('bcryptjs failed to match password');
    }
  } catch (error) {
    console.error('bcryptjs error:', error);
  }
}

testBcrypt();
