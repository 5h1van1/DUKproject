import { saveRsvp, subscribeToRsvps, deleteRsvp, resetDemoData, generateDocId } from './src/services/db.js';

async function testRsvpFlow() {
  console.log('🧪 Starting RSVP Flow and Database Verification...\n');

  let currentRsvps = [];
  const unsub = subscribeToRsvps((list) => {
    currentRsvps = list;
  });

  console.log(`✓ Initial pre-seeded demo RSVPs count: ${currentRsvps.length}`);
  const initialCount = currentRsvps.length;

  // 1. Submit a new RSVP
  console.log('Submitting new RSVP for "Tanmay Bhat"...');
  const res1 = await saveRsvp({
    name: 'Tanmay Bhat',
    team: 'groom',
    preferredDate: '2026-01-28',
    needsJersey: true,
    jerseySize: 'XL',
  });
  console.log('✓ Result 1:', res1);

  // Check list
  const found1 = currentRsvps.find((r) => r.id === generateDocId('Tanmay Bhat'));
  console.log('✓ Found inserted RSVP:', found1 ? `${found1.name} (Team: ${found1.team}, Jersey: ${found1.jerseySize})` : 'NOT FOUND');
  if (currentRsvps.length !== initialCount + 1) {
    throw new Error(`Expected count to increase by 1, but got ${currentRsvps.length}`);
  }

  // 2. Resubmit with same name to test duplicate prevention & update behavior
  console.log('\nResubmitting for "Tanmay Bhat" with changed squad (Team Bride) and size (L)...');
  const res2 = await saveRsvp({
    name: 'Tanmay Bhat',
    team: 'bride',
    preferredDate: '2026-01-29',
    needsJersey: true,
    jerseySize: 'L',
  });
  console.log('✓ Result 2 (isUpdate):', res2);

  const found2 = currentRsvps.find((r) => r.id === generateDocId('Tanmay Bhat'));
  console.log('✓ Found updated RSVP:', found2 ? `${found2.name} (Team: ${found2.team}, Size: ${found2.jerseySize}, Date: ${found2.preferredDate})` : 'NOT FOUND');

  if (currentRsvps.length !== initialCount + 1) {
    throw new Error(`Duplicate created! Count is ${currentRsvps.length}, expected ${initialCount + 1}`);
  }
  if (found2.team !== 'bride' || found2.jerseySize !== 'L') {
    throw new Error('RSVP did not update with new values!');
  }
  console.log('✓ Duplicate prevention confirmed: 0 duplicate documents created, record was correctly updated.');

  // 3. Verify Admin Calculations
  console.log('\nVerifying Admin metrics calculations:');
  const brideCount = currentRsvps.filter((r) => r.team === 'bride').length;
  const groomCount = currentRsvps.filter((r) => r.team === 'groom').length;
  const jerseyLCount = currentRsvps.filter((r) => r.needsJersey && r.jerseySize === 'L').length;
  console.log(`- Total Guests: ${currentRsvps.length}`);
  console.log(`- Team Bride: ${brideCount}`);
  console.log(`- Team Groom: ${groomCount}`);
  console.log(`- Size L Jerseys Needed: ${jerseyLCount}`);

  // Clean up test entry
  await deleteRsvp(generateDocId('Tanmay Bhat'));
  console.log(`✓ Cleaned up test record. Count is now back to: ${currentRsvps.length}`);

  unsub();
  console.log('\n🎉 ALL TESTS PASSED SUCCESSFULLY!');
}

testRsvpFlow().catch((err) => {
  console.error('❌ Test failed:', err);
  process.exit(1);
});
