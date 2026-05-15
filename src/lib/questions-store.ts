import { supabase } from "@/integrations/supabase/client";

export type Question = {
  id: string;
  topic_id: string;
  text: string;
  options: [string, string, string, string];
  correctIndex: 0 | 1 | 2 | 3;
};

export type Topic = {
  id: string;
  name: string;
};

type QuestionRow = {
  id: string;
  topic_id: string;
  text: string;
  options: unknown;
  correct_index: number;
};

function rowToQuestion(r: QuestionRow): Question {
  const opts = Array.isArray(r.options) ? (r.options as string[]) : ["", "", "", ""];
  const padded = [opts[0] ?? "", opts[1] ?? "", opts[2] ?? "", opts[3] ?? ""] as [
    string,
    string,
    string,
    string,
  ];
  return {
    id: r.id,
    topic_id: r.topic_id,
    text: r.text,
    options: padded,
    correctIndex: Math.min(3, Math.max(0, r.correct_index)) as 0 | 1 | 2 | 3,
  };
}

// Topics
export async function fetchTopics(): Promise<Topic[]> {
  const { data, error } = await supabase
    .from("topics")
    .select("id,name")
    .order("created_at", { ascending: true });
  if (error) throw error;
  return data ?? [];
}

export async function createTopic(name: string): Promise<Topic> {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("topics")
    .insert({ name, user_id: userData.user.id })
    .select("id,name")
    .single();
  if (error) throw error;
  return data;
}

export async function renameTopic(id: string, name: string): Promise<void> {
  const { error } = await supabase.from("topics").update({ name }).eq("id", id);
  if (error) throw error;
}

export async function deleteTopic(id: string): Promise<void> {
  const { error } = await supabase.from("topics").delete().eq("id", id);
  if (error) throw error;
}

// Questions
export async function fetchQuestionsByTopic(topicId: string): Promise<Question[]> {
  const { data, error } = await supabase
    .from("questions")
    .select("id,topic_id,text,options,correct_index")
    .eq("topic_id", topicId)
    .order("created_at", { ascending: true });
  if (error) throw error;
  return (data as QuestionRow[]).map(rowToQuestion);
}

export async function createQuestion(input: Omit<Question, "id">): Promise<Question> {
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData.user) throw new Error("Not authenticated");
  const { data, error } = await supabase
    .from("questions")
    .insert({
      topic_id: input.topic_id,
      text: input.text,
      options: input.options,
      correct_index: input.correctIndex,
      user_id: userData.user.id,
    })
    .select("id,topic_id,text,options,correct_index")
    .single();
  if (error) throw error;
  return rowToQuestion(data as QuestionRow);
}

export async function updateQuestion(q: Question): Promise<void> {
  const { error } = await supabase
    .from("questions")
    .update({
      text: q.text,
      options: q.options,
      correct_index: q.correctIndex,
    })
    .eq("id", q.id);
  if (error) throw error;
}

export async function deleteQuestion(id: string): Promise<void> {
  const { error } = await supabase.from("questions").delete().eq("id", id);
  if (error) throw error;
}
