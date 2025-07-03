const fetch = require('node-fetch').default;

const BASE_URL = 'http://localhost:3001';

async function testPatientNumberAPI() {
  console.log('🧪 Testing 환자번호 (Patient Number) API functionality...\n');

  try {
    // Test 1: Create a new patient with 환자번호
    console.log('1️⃣ Testing patient creation with 환자번호...');
    const createResponse = await fetch(`${BASE_URL}/api/patients`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        fullName: 'Test Patient',
        dateOfBirth: '1990-01-01',
        gender: 'MALE',
        phoneNumber: '010-1234-5678',
        email: 'test@example.com',
        address: 'Test Address',
        medicalHistory: 'No significant history',
        recordNumber: 'TEST001' // 환자번호
      })
    });

    if (createResponse.ok) {
      const createdPatient = await createResponse.json();
      console.log('✅ Patient created successfully with 환자번호:', createdPatient.recordNumber);
      console.log('   Patient ID:', createdPatient.id);
      
      // Test 2: Update the patient's 환자번호
      console.log('\n2️⃣ Testing patient 환자번호 update...');
      const updateResponse = await fetch(`${BASE_URL}/api/patients/${createdPatient.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fullName: 'Test Patient Updated',
          dateOfBirth: '1990-01-01',
          gender: 'MALE',
          phoneNumber: '010-1234-5678',
          email: 'test@example.com',
          address: 'Test Address',
          medicalHistory: 'No significant history',
          recordNumber: 'TEST001-UPDATED' // Updated 환자번호
        })
      });

      if (updateResponse.ok) {
        const updatedPatient = await updateResponse.json();
        console.log('✅ Patient 환자번호 updated successfully:', updatedPatient.recordNumber);
        
        // Test 3: Fetch the patient to verify the change
        console.log('\n3️⃣ Testing patient fetch to verify 환자번호...');
        const fetchResponse = await fetch(`${BASE_URL}/api/patients/${createdPatient.id}`);
        
        if (fetchResponse.ok) {
          const fetchedPatient = await fetchResponse.json();
          console.log('✅ Patient fetched successfully');
          console.log('   Original 환자번호: TEST001');
          console.log('   Updated 환자번호:', fetchedPatient.recordNumber);
          console.log('   Full Name:', fetchedPatient.fullName);
          
          if (fetchedPatient.recordNumber === 'TEST001-UPDATED') {
            console.log('🎉 SUCCESS: 환자번호 editing functionality is working correctly!');
          } else {
            console.log('❌ FAILED: 환자번호 was not updated correctly');
          }
        } else {
          console.log('❌ FAILED: Could not fetch patient');
        }
      } else {
        console.log('❌ FAILED: Could not update patient');
        const errorText = await updateResponse.text();
        console.log('   Error:', errorText);
      }
    } else {
      console.log('❌ FAILED: Could not create patient');
      const errorText = await createResponse.text();
      console.log('   Error:', errorText);
    }

  } catch (error) {
    console.log('❌ ERROR:', error.message);
  }
}

// Run the test
testPatientNumberAPI(); 