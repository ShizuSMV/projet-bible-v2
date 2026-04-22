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

// --- Favoris ---

async function sbGetFavorites(uid) {
	const { data } = await _db()
		.from('favorites')
		.select('*')
		.eq('user_id', uid)
		.order('created_at', { ascending: false })
	return data || []
}

async function sbAddFavorite(uid, ref, text) {
	await _db().from('favorites').upsert(
		{ user_id: uid, ref, text },
		{ onConflict: 'user_id,ref' }
	)
}

async function sbRemoveFavorite(uid, ref) {
	await _db().from('favorites').delete().eq('user_id', uid).eq('ref', ref)
}
