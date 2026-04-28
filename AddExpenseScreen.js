// screens/AddExpenseScreen.js
// ---------------------------------------------------------------------------
// Form for adding a new expense. Validates that title, amount, payer, and
// at least one splitter are present before saving. Persists immediately
// and navigates back; HomeScreen and ExpensesScreen re-read on focus.
// ---------------------------------------------------------------------------

import React, { useState, useEffect } from 'react';
import {
  View, Text, TextInput, StyleSheet, ScrollView,
  TouchableOpacity, KeyboardAvoidingView, Platform, Alert,
} from 'react-native';
import { CATEGORIES } from '../data/initialData';
import { loadPeople, loadExpenses, saveExpenses } from '../logic/storage';

function todayISO() {
  const d = new Date();
  const pad = (n) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}

export default function AddExpenseScreen({ navigation }) {
  const [people, setPeople] = useState([]);

  const [title,      setTitle]      = useState('');
  const [amount,     setAmount]     = useState('');
  const [category,   setCategory]   = useState(CATEGORIES[0]);
  const [paidBy,     setPaidBy]     = useState(null);
  const [splitAmong, setSplitAmong] = useState([]);
  const [date,       setDate]       = useState(todayISO());
  const [notes,      setNotes]      = useState('');
  const [errors,     setErrors]     = useState({});

  useEffect(() => {
    loadPeople().then((p) => {
      setPeople(p);
      if (p.length > 0) setPaidBy(p[0].id);
      setSplitAmong(p.map((x) => x.id)); // default: split among everyone
    });
  }, []);

  const toggleSplit = (id) => {
    setSplitAmong((curr) =>
      curr.includes(id) ? curr.filter((x) => x !== id) : [...curr, id],
    );
  };

  const validate = () => {
    const e = {};
    if (!title.trim()) e.title = 'Required';
    const a = parseFloat(amount);
    if (Number.isNaN(a) || a <= 0) e.amount = 'Must be > 0';
    if (!paidBy) e.paidBy = 'Pick a payer';
    if (splitAmong.length === 0) e.splitAmong = 'Pick at least one';
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) e.date = 'YYYY-MM-DD';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSave = async () => {
    if (!validate()) return;
    const list = await loadExpenses();
    const id = `e${Date.now().toString(36)}`;
    const next = [
      ...list,
      {
        id,
        title: title.trim(),
        amount: Math.round(parseFloat(amount) * 100) / 100,
        paidBy,
        splitAmong,
        category,
        date,
        notes: notes.trim(),
      },
    ];
    await saveExpenses(next);
    navigation.goBack();
  };

  const handleCancel = () => {
    if (title || amount || notes) {
      Alert.alert('Discard expense?', 'Your changes won\'t be saved.', [
        { text: 'Keep editing', style: 'cancel' },
        { text: 'Discard', style: 'destructive', onPress: () => navigation.goBack() },
      ]);
    } else {
      navigation.goBack();
    }
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#f7f8fb' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">

        <Text style={styles.label}>Title</Text>
        <TextInput
          style={[styles.input, errors.title && styles.inputErr]}
          placeholder="e.g. Tesco shop"
          value={title}
          onChangeText={setTitle}
        />
        {errors.title ? <Text style={styles.err}>{errors.title}</Text> : null}

        <Text style={styles.label}>Amount (£)</Text>
        <TextInput
          style={[styles.input, errors.amount && styles.inputErr]}
          placeholder="0.00"
          value={amount}
          onChangeText={setAmount}
          keyboardType="decimal-pad"
        />
        {errors.amount ? <Text style={styles.err}>{errors.amount}</Text> : null}

        <Text style={styles.label}>Category</Text>
        <View style={styles.chipsRow}>
          {CATEGORIES.map((c) => {
            const active = c === category;
            return (
              <TouchableOpacity
                key={c}
                onPress={() => setCategory(c)}
                style={[styles.chip, active && styles.chipActive]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{c}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>Paid by</Text>
        <View style={styles.chipsRow}>
          {people.map((p) => {
            const active = p.id === paidBy;
            return (
              <TouchableOpacity
                key={p.id}
                onPress={() => setPaidBy(p.id)}
                style={[styles.chip, active && { backgroundColor: p.color, borderColor: p.color }]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>{p.name}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <Text style={styles.label}>Split among</Text>
        <View style={styles.chipsRow}>
          {people.map((p) => {
            const active = splitAmong.includes(p.id);
            return (
              <TouchableOpacity
                key={p.id}
                onPress={() => toggleSplit(p.id)}
                style={[styles.chip, active && { backgroundColor: p.color, borderColor: p.color }]}
              >
                <Text style={[styles.chipText, active && styles.chipTextActive]}>
                  {active ? '✓ ' : ''}{p.name}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
        {errors.splitAmong ? <Text style={styles.err}>{errors.splitAmong}</Text> : null}

        <Text style={styles.label}>Date</Text>
        <TextInput
          style={[styles.input, errors.date && styles.inputErr]}
          placeholder="YYYY-MM-DD"
          value={date}
          onChangeText={setDate}
        />
        {errors.date ? <Text style={styles.err}>{errors.date}</Text> : null}

        <Text style={styles.label}>Notes (optional)</Text>
        <TextInput
          style={[styles.input, { height: 70, textAlignVertical: 'top' }]}
          placeholder="anything to add…"
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        <TouchableOpacity style={styles.btn} onPress={handleSave} activeOpacity={0.85}>
          <Text style={styles.btnText}>Save expense</Text>
        </TouchableOpacity>

        <TouchableOpacity style={styles.btnOutline} onPress={handleCancel} activeOpacity={0.85}>
          <Text style={styles.btnOutlineText}>Cancel</Text>
        </TouchableOpacity>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  content: { padding: 16, paddingBottom: 40 },
  label:    { fontSize: 12, fontWeight: '700', color: '#444', marginTop: 12, marginBottom: 4 },
  input: {
    backgroundColor: '#fff', borderWidth: 1, borderColor: '#dcdde6',
    borderRadius: 10, padding: 12, fontSize: 14, color: '#222',
  },
  inputErr: { borderColor: '#b8312f' },
  err:      { color: '#b8312f', fontSize: 11, marginTop: 4, fontWeight: '600' },

  chipsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 4 },
  chip: {
    paddingVertical: 6, paddingHorizontal: 12,
    borderRadius: 999, borderWidth: 1, borderColor: '#dcdde6',
    backgroundColor: '#fff', marginRight: 6, marginBottom: 6,
  },
  chipActive: { backgroundColor: '#6c5ce7', borderColor: '#6c5ce7' },
  chipText:       { fontSize: 12, color: '#444', fontWeight: '600' },
  chipTextActive: { color: '#fff' },

  btn: {
    backgroundColor: '#6c5ce7', borderRadius: 10,
    padding: 14, alignItems: 'center', marginTop: 20,
  },
  btnText: { color: '#fff', fontSize: 15, fontWeight: '700' },
  btnOutline: {
    borderWidth: 1, borderColor: '#6c5ce7', borderRadius: 10,
    padding: 13, alignItems: 'center', marginTop: 8,
  },
  btnOutlineText: { color: '#6c5ce7', fontSize: 15, fontWeight: '600' },
});
