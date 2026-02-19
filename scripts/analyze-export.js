const data = require('c:/Users/echon/Downloads/analysis-export-2026-02-17.json');
const entries = data.data;
console.log('=== 기본 통계 ===');
console.log('Total entries:', entries.length);

const slipCounts = {};
entries.forEach(e => { slipCounts[e.slip || 'null'] = (slipCounts[e.slip || 'null'] || 0) + 1; });
console.log('\nSLIP distribution:', JSON.stringify(slipCounts, null, 2));

const statusCounts = {};
entries.forEach(e => { statusCounts[e.status] = (statusCounts[e.status] || 0) + 1; });
console.log('\nStatus:', JSON.stringify(statusCounts, null, 2));

const dates = entries.map(e => new Date(e.created_at)).sort((a,b) => a-b);
console.log('\nDate range:', dates[0].toISOString().split('T')[0], '~', dates[dates.length-1].toISOString().split('T')[0]);

const langs = {};
entries.forEach(e => { langs[e.user_language] = (langs[e.user_language] || 0) + 1; });
console.log('Language:', JSON.stringify(langs));

const models = {};
entries.forEach(e => { models[e.model_name || 'null'] = (models[e.model_name || 'null'] || 0) + 1; });
console.log('Models:', JSON.stringify(models));

const slipSoft = entries.filter(e => e.slip === 'soft');
const slipNone = entries.filter(e => e.slip === 'none');
const slipHard = entries.filter(e => e.slip === 'hard');
const slipNull = entries.filter(e => !e.slip);
console.log('\n=== SLIP ===');
console.log('none:', slipNone.length, '| soft:', slipSoft.length, '| hard:', slipHard.length, '| null:', slipNull.length);

if (slipSoft.length > 0) {
  console.log('\n--- Soft entries detail ---');
  slipSoft.forEach((e, i) => {
    console.log(`  [${i+1}] sentiment:${e.sentiment_score} a:${e.affect_tier} m:${e.momentum_tier} ethics:${e.ethics} date:${e.created_at.split('T')[0]}`);
  });
}

const r2 = entries.filter(e => e.affect_tier >= 4.5 && e.momentum_tier >= 4.5);
console.log('\n=== R2 candidates (a>=4.5 & m>=4.5) ===');
console.log('Count:', r2.length);
r2.forEach((e, i) => {
  console.log(`  [${i+1}] slip:${e.slip} sent:${e.sentiment_score} a:${e.affect_tier} m:${e.momentum_tier} ethics:${e.ethics}`);
});

const allTags = {};
entries.forEach(e => {
  if (e.ethics) {
    e.ethics.split(',').map(t => t.trim()).forEach(tag => {
      if (tag) allTags[tag] = (allTags[tag] || 0) + 1;
    });
  }
});
const sortedTags = Object.entries(allTags).sort((a,b) => b[1] - a[1]);
console.log('\n=== Top 25 Ethics Tags ===');
sortedTags.slice(0, 25).forEach(([tag, count]) => {
  console.log(`  ${tag}: ${count} (${(count/entries.length*100).toFixed(1)}%)`);
});
console.log('Total unique tags:', sortedTags.length);

const predefined = ['reflection','connection','growth','resilience','hope','creativity','exhaustion','uncertainty','overwhelm','isolation','hopelessness','numbness'];
const predUsed = sortedTags.filter(([tag]) => predefined.includes(tag));
const custom = sortedTags.filter(([tag]) => predefined.indexOf(tag) === -1);
console.log('\nPredefined tags used:', predUsed.length, '/', predefined.length);
console.log('Custom tags:', custom.length);

// Sentiment
const completed = entries.filter(e => e.status === 'COMPLETED');
const sents = completed.map(e => e.sentiment_score).filter(x => x !== null && x !== undefined);
const mean = sents.reduce((a,b) => a+b, 0) / sents.length;
const sorted = [...sents].sort((a,b) => a-b);
const median = sorted[Math.floor(sorted.length/2)];
console.log('\n=== Sentiment (completed only) ===');
console.log(`N:${sents.length} Mean:${mean.toFixed(1)} Median:${median} Min:${Math.min(...sents)} Max:${Math.max(...sents)}`);

// Soft vs None sentiment comparison
if (slipSoft.length > 0 && slipNone.length > 0) {
  const softSent = slipSoft.map(e => e.sentiment_score).filter(x => x != null);
  const noneSent = slipNone.map(e => e.sentiment_score).filter(x => x != null);
  const softMean = softSent.reduce((a,b) => a+b, 0) / softSent.length;
  const noneMean = noneSent.reduce((a,b) => a+b, 0) / noneSent.length;
  console.log(`\nSoft sentiment: M=${softMean.toFixed(1)} (n=${softSent.length})`);
  console.log(`None sentiment: M=${noneMean.toFixed(1)} (n=${noneSent.length})`);
}

// Unique diary IDs
const diaryIds = new Set(entries.map(e => e.diary_id));
console.log('\nUnique diary_ids:', diaryIds.size);

// Tier A/M ranges
const tAs = completed.map(e => e.affect_tier).filter(x => x != null);
const tMs = completed.map(e => e.momentum_tier).filter(x => x != null);
console.log(`\n=== Tier ranges ===`);
console.log(`tier_a: ${Math.min(...tAs)}-${Math.max(...tAs)} (mean: ${(tAs.reduce((a,b)=>a+b,0)/tAs.length).toFixed(2)})`);
console.log(`tier_m: ${Math.min(...tMs)}-${Math.max(...tMs)} (mean: ${(tMs.reduce((a,b)=>a+b,0)/tMs.length).toFixed(2)})`);
