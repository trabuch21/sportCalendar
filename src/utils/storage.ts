import { User, Race } from '../types';
import { supabase } from '../lib/supabase';

// Helper function to convert database race to Race type
function dbRaceToRace(dbRace: any): Race {
  return {
    id: dbRace.id,
    userId: dbRace.user_id,
    name: dbRace.name,
    date: dbRace.date,
    raceType: dbRace.race_type,
    distance: dbRace.distance,
    actualDistance: dbRace.actual_distance,
    // Multi-day races
    isMultiDay: dbRace.is_multi_day || false,
    dayDistances: dbRace.day_distances,
    // Elevation
    elevation: dbRace.elevation,
    swimmingDistance: dbRace.swimming_distance,
    cyclingDistance: dbRace.cycling_distance,
    runningDistance: dbRace.running_distance,
    firstRunDistance: dbRace.first_run_distance,
    // Duathlon customizable fields
    firstDiscipline: dbRace.first_discipline,
    secondDiscipline: dbRace.second_discipline,
    firstDisciplineData: dbRace.first_discipline_data,
    secondDisciplineData: dbRace.second_discipline_data,
    firstDisciplineTime: dbRace.first_discipline_time,
    secondDisciplineTime: dbRace.second_discipline_time,
    transition1Time: dbRace.transition1_time,
    transition2Time: dbRace.transition2_time,
    targetTime: dbRace.target_time,
    actualTime: dbRace.actual_time,
    swimmingTime: dbRace.swimming_time,
    cyclingTime: dbRace.cycling_time,
    runningTime: dbRace.running_time,
    firstRunTime: dbRace.first_run_time,
    priority: dbRace.priority,
    goal: dbRace.goal,
    notes: dbRace.notes,
    createdAt: dbRace.created_at,
    updatedAt: dbRace.updated_at,
  };
}

// Helper function to convert Race type to database format
function raceToDbRace(race: Race): any {
  return {
    id: race.id,
    user_id: race.userId,
    name: race.name,
    date: race.date,
    race_type: race.raceType,
    distance: race.distance,
    actual_distance: race.actualDistance,
    // Multi-day races
    is_multi_day: race.isMultiDay,
    day_distances: race.dayDistances,
    // Elevation
    elevation: race.elevation,
    swimming_distance: race.swimmingDistance,
    cycling_distance: race.cyclingDistance,
    running_distance: race.runningDistance,
    first_run_distance: race.firstRunDistance,
    // Duathlon customizable fields
    first_discipline: race.firstDiscipline,
    second_discipline: race.secondDiscipline,
    first_discipline_data: race.firstDisciplineData,
    second_discipline_data: race.secondDisciplineData,
    first_discipline_time: race.firstDisciplineTime,
    second_discipline_time: race.secondDisciplineTime,
    transition1_time: race.transition1Time,
    transition2_time: race.transition2Time,
    target_time: race.targetTime,
    actual_time: race.actualTime,
    swimming_time: race.swimmingTime,
    cycling_time: race.cyclingTime,
    running_time: race.runningTime,
    first_run_time: race.firstRunTime,
    priority: race.priority,
    goal: race.goal,
    notes: race.notes,
  };
}

// Helper function to convert database profile to User type
function dbProfileToUser(dbProfile: any): User {
  return {
    id: dbProfile.id,
    email: dbProfile.email,
    name: dbProfile.name,
    createdAt: dbProfile.created_at,
  };
}

// User storage functions
export async function saveUser(user: User): Promise<void> {
  const { error } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      email: user.email,
      name: user.name,
    }, {
      onConflict: 'id'
    });

  if (error) {
    console.error('Error saving user:', error);
    throw error;
  }
}

export async function getUserById(id: string): Promise<User | null> {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        return null; // Not found
      }
      // Ignore abort errors
      if (error.message?.includes('aborted') || error.name === 'AbortError') {
        console.warn('Request was aborted');
        return null;
      }
      console.error('Error getting user:', error);
      throw error;
    }

    return data ? dbProfileToUser(data) : null;
  } catch (error: any) {
    // Ignore abort errors
    if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
      console.warn('Request was aborted');
      return null;
    }
    throw error;
  }
}

export async function getUserByEmail(email: string): Promise<User | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('email', email)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error getting user by email:', error);
    throw error;
  }

  return data ? dbProfileToUser(data) : null;
}

// Get current user from Supabase auth session
export async function getCurrentUser(): Promise<User | null> {
  const { data: { user: authUser } } = await supabase.auth.getUser();
  
  if (!authUser) {
    return null;
  }

  return getUserById(authUser.id);
}

// Race storage functions
export async function saveRace(race: Race): Promise<void> {
  try {
    const dbRace = raceToDbRace(race);
    
    // Validate required fields
    if (!dbRace.user_id || !dbRace.name || !dbRace.date || !dbRace.race_type) {
      throw new Error('Missing required fields');
    }
    
    // Remove undefined/null/NaN fields to avoid issues with Supabase
    const cleanDbRace = Object.fromEntries(
      Object.entries(dbRace).filter(([_, value]) => {
        if (value === undefined || value === null) return false;
        if (typeof value === 'number' && isNaN(value)) return false;
        return true;
      })
    );
    
    console.log('Saving race with data:', cleanDbRace);
    
    const { error, data } = await supabase
      .from('races')
      .upsert(cleanDbRace, {
        onConflict: 'id'
      })
      .select();

    if (error) {
      // Check if it's a column error (missing columns in DB)
      if (error.message?.includes('column') || error.code === '42703') {
        console.error('Database schema error - missing columns:', error);
        throw new Error(`Error de esquema de base de datos: ${error.message}. Ejecuta la migración supabase-migration-duathlon.sql`);
      }
      
      // Ignore abort errors
      if (error.message?.includes('aborted') || error.name === 'AbortError') {
        console.warn('Request was aborted, retrying...');
        // Retry once after a short delay
        await new Promise(resolve => setTimeout(resolve, 500));
        const retryResult = await supabase
          .from('races')
          .upsert(cleanDbRace, {
            onConflict: 'id'
          })
          .select();
        
        if (retryResult.error) {
          console.error('Error saving race (retry failed):', retryResult.error);
          throw retryResult.error;
        }
        console.log('Race saved successfully after retry');
        return;
      }
      
      console.error('Error saving race:', error);
      console.error('Race data:', cleanDbRace);
      throw error;
    }
    
    console.log('Race saved successfully:', data);
  } catch (error: any) {
    // Ignore abort errors that might occur during component unmount
    if (error?.name === 'AbortError' || error?.message?.includes('aborted')) {
      console.warn('Request was aborted (component may have unmounted)');
      // Don't throw - this is usually harmless
      return;
    }
    throw error;
  }
}

export async function getRaces(userId?: string): Promise<Race[]> {
  let query = supabase
    .from('races')
    .select('*')
    .order('date', { ascending: true });

  if (userId) {
    query = query.eq('user_id', userId);
  }

  const { data, error } = await query;

  if (error) {
    console.error('Error getting races:', error);
    throw error;
  }

  return data ? data.map(dbRaceToRace) : [];
}

export async function getRaceById(id: string): Promise<Race | null> {
  const { data, error } = await supabase
    .from('races')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    console.error('Error getting race:', error);
    throw error;
  }

  return data ? dbRaceToRace(data) : null;
}

export async function deleteRace(id: string): Promise<void> {
  const { error } = await supabase
    .from('races')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting race:', error);
    throw error;
  }
}

// Generate UUID (Supabase uses UUIDs, but we can keep this for compatibility)
export function generateId(): string {
  return crypto.randomUUID();
}
