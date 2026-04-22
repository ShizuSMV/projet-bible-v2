// ============================================================
// SUPABASE — Client & helpers
// ============================================================

const _SUPA_URL = 'https://xcwhnzoliodnkkyyjbrh.supabase.co'
const _SUPA_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhjd2huem9saW9kbmtreXlqYnJoIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY4MDM3MzcsImV4cCI6MjA5MjM3OTczN30.5h4ZfCKbjg0sV9KjDL7r-pWp7LZUDvb6Jn1Qqrfc-Zo'

function _db() {
	if (!window._supabaseClient) {
		window._supabaseClient = window.supabase.createClient(_SUPA_URL, _SUPA_KEY)
	}
	return window._supabaseClient
}

// --- Stats ---

async function sbGetStats(uid) {
	const { data } = await _db()
		.from('user_stats')
		.select('*')
		.eq('user_id', uid)
		.single()
	return data
}

async function sbTrackRead(uid, verseCount) {
	const today     = new Date().toISOString().slice(0, 10)
	const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10)

	const stats = await sbGetStats(uid)

	let streak     = stats?.streak     ?? 0
	let streakMax  = stats?.streak_max ?? 0
	let versetsLus = stats?.versets_lus ?? 0
	const lastDate = stats?.last_read_date

	if (lastDate !== today) {
		streak    = lastDate === yesterday ? streak + 1 : 1
		streakMax = Math.max(streak, streakMax)
		versetsLus += verseCount
	}

	await _db().from('user_stats').upsert({
		user_id:        uid,
		streak,
		streak_max:     streakMax,
		versets_lus:    versetsLus,
		last_read_date: today
	})

	return { streak, streakMax, versetsLus }
}

// --- Helpers génériques ---

async function _sbGetVerses(table, uid) {
	const { data } = await _db()
		.from(table)
		.select('*')
		.eq('user_id', uid)
		.order('created_at', { ascending: false })
	return data || []
}

async function _sbAddVerse(table, uid, ref, text) {
	await _db().from(table).upsert(
		{ user_id: uid, ref, ...(text !== undefined ? { text } : {}) },
		{ onConflict: 'user_id,ref' }
	)
}

async function _sbRemoveVerse(table, uid, ref) {
	await _db().from(table).delete().eq('user_id', uid).eq('ref', ref)
}

// --- Favoris ---
async function sbGetFavorites(uid)              { return _sbGetVerses('favorites', uid) }
async function sbAddFavorite(uid, ref, text)    { return _sbAddVerse('favorites', uid, ref, text) }
async function sbRemoveFavorite(uid, ref)       { return _sbRemoveVerse('favorites', uid, ref) }

// --- Enregistrés ---
async function sbGetSaved(uid)                  { return _sbGetVerses('saved_verses', uid) }
async function sbAddSaved(uid, ref, text)       { return _sbAddVerse('saved_verses', uid, ref, text) }
async function sbRemoveSaved(uid, ref)          { return _sbRemoveVerse('saved_verses', uid, ref) }

// --- Lus ---
async function sbGetRead(uid)                   { return _sbGetVerses('read_verses', uid) }
async function sbAddRead(uid, ref)              { return _sbAddVerse('read_verses', uid, ref, undefined) }
async function sbRemoveRead(uid, ref)           { return _sbRemoveVerse('read_verses', uid, ref) }
