document.getElementById('userForm').addEventListener('submit', async function (e) {
  e.preventDefault();
  
  // Retrieve form values
  const username = document.getElementById('user_name').value.trim();
  const rollnumber = document.getElementById('roll_number').value.trim();
  
  // Regex for roll number: exactly 10 alphanumeric characters with at least one letter and one digit.
  const rollRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{10}$/;
  
  // Validate fields are not empty
  if (username === '' || rollnumber === '') {
    alert('Please fill in all fields.');
    return;
  }
  
  // Validate roll number format
  if (!rollRegex.test(rollnumber)) {
    alert('Roll number must be exactly 10 alphanumeric characters and include at least one letter and one digit.');
    return;
  }
  
  console.log('User Name:', username);
  console.log('Roll Number:', rollnumber);
  
  // Check if the roll number exists in the database by calling the /api/checkUser endpoint
  try {
    const response = await fetch('https://kcea-attendance-portal.onrender.com/api/checkUser', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ rollNumber: rollnumber })
    });
    
    const result = await response.json();
    console.log('Check user result:', result);
    
    if (result.exists) {
      // If the user exists, redirect to home.html
      window.location.href = `pages/home.html?rollNumber=${rollnumber}`;
    } else {
      // If the user does not exist, alert the user and redirect to register.html
      alert("Your face is not registered. Please register your face.");
      window.location.href = `pages/register.html`;
    }
  } catch (error) {
    console.error('Error checking user:', error);
    alert('Error checking user. Please try again later.');
  }
});
