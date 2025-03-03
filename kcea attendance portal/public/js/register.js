document.getElementById('userForm').addEventListener('submit', async function (e) {
    e.preventDefault();

    const rollnumber = document.getElementById('roll_number').value.trim();
    const username = document.getElementById('user_name').value.trim();

    const rollRegex = /^(?=.*[A-Za-z])(?=.*\d)[A-Za-z\d]{10}$/;

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
          alert("The given roll number is already registered. ")
        } else {
        
        //   redirect to Face.html
            window.location.href = `face.html?rollNumber=${rollnumber}`;
        }
      } catch (error) {
        console.error('Error checking user:', error);
        alert('Error checking user. Please try again later.');
      }
    });
