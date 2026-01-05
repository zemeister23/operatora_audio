const fs = require('fs');
const path = require('path');
const db = require('./db');

const metadataPath = path.join(__dirname, 'data', 'audio-metadata.json');

async function migrate() {
  console.log('Starting migration from JSON to SQLite database...');
  console.log('================================================');
  
  try {
    // Initialize database
    await db.getDatabase();
    console.log('✓ Database initialized');
    
    // Check if JSON file exists
    if (!fs.existsSync(metadataPath)) {
      console.log('⚠ No existing JSON metadata file found. Nothing to migrate.');
      console.log('  Starting fresh with SQLite database.');
      return;
    }
    
    // Read JSON file
    console.log(`\nReading JSON file: ${metadataPath}`);
    const jsonData = fs.readFileSync(metadataPath, 'utf8');
    
    if (!jsonData || jsonData.trim() === '') {
      console.log('⚠ JSON file is empty. Nothing to migrate.');
      return;
    }
    
    let audioFiles;
    try {
      audioFiles = JSON.parse(jsonData);
    } catch (parseError) {
      console.error('✗ Error parsing JSON file:', parseError.message);
      return;
    }
    
    if (!Array.isArray(audioFiles)) {
      console.log('⚠ JSON file does not contain an array. Nothing to migrate.');
      return;
    }
    
    if (audioFiles.length === 0) {
      console.log('⚠ JSON file contains no audio files. Nothing to migrate.');
      return;
    }
    
    console.log(`✓ Found ${audioFiles.length} audio file(s) in JSON`);
    
    // Check existing database records
    const existingAudio = await db.getAllAudio();
    console.log(`✓ Found ${existingAudio.length} existing record(s) in database`);
    
    if (existingAudio.length > 0) {
      console.log('\n⚠ Warning: Database already contains records.');
      console.log('  Migration will add new records but may create duplicates.');
      console.log('  Existing records will be preserved.');
    }
    
    // Migrate each audio file
    console.log('\nMigrating audio files...');
    let successCount = 0;
    let errorCount = 0;
    const errors = [];
    
    for (let i = 0; i < audioFiles.length; i++) {
      const audio = audioFiles[i];
      
      try {
        // Check if file exists on disk
        if (!fs.existsSync(audio.path)) {
          console.log(`⚠ Skipping ${audio.originalName || audio.id}: File not found at ${audio.path}`);
          errorCount++;
          errors.push({
            audio: audio.originalName || audio.id,
            error: 'File not found on disk'
          });
          continue;
        }
        
        // Insert into database
        await db.insertAudio(audio);
        successCount++;
        
        if ((i + 1) % 10 === 0) {
          console.log(`  Migrated ${i + 1}/${audioFiles.length} files...`);
        }
      } catch (error) {
        errorCount++;
        errors.push({
          audio: audio.originalName || audio.id,
          error: error.message
        });
        console.error(`✗ Error migrating ${audio.originalName || audio.id}:`, error.message);
      }
    }
    
    console.log('\n================================================');
    console.log('Migration completed!');
    console.log(`✓ Successfully migrated: ${successCount} file(s)`);
    if (errorCount > 0) {
      console.log(`✗ Errors: ${errorCount} file(s)`);
      console.log('\nErrors:');
      errors.forEach(err => {
        console.log(`  - ${err.audio}: ${err.error}`);
      });
    }
    
    // Backup JSON file
    const backupPath = `${metadataPath}.backup.${Date.now()}`;
    try {
      fs.copyFileSync(metadataPath, backupPath);
      console.log(`\n✓ JSON file backed up to: ${backupPath}`);
      console.log('  You can safely delete the backup after verifying the migration.');
    } catch (backupError) {
      console.log(`\n⚠ Could not create backup: ${backupError.message}`);
    }
    
    // Verify migration
    const finalCount = await db.getAllAudio();
    console.log(`\n✓ Total records in database: ${finalCount.length}`);
    
  } catch (error) {
    console.error('\n✗ Migration failed:', error);
    console.error('Error stack:', error.stack);
    process.exit(1);
  } finally {
    await db.closeDatabase();
  }
}

// Run migration
migrate()
  .then(() => {
    console.log('\nMigration script finished.');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\nFatal error:', error);
    process.exit(1);
  });
