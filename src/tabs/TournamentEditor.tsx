import React, { useState } from 'react';
import { FormLayout, Input, Select, Button, Div } from '@vkontakte/vkui';
import { db } from '../firebase';
import { addDoc, doc, collection } from 'firebase/firestore';
import LogoUrlInput from '../components/LogoUrlInput';

const TournamentEditor = ({ user, tournament, onSaved }: { user: any; tournament?: any; onSaved: (t: any) => void }) => {
  const [name, setName] = useState(tournament?.name || '');
  const [type, setType] = useState(tournament?.type || 'league');
  const [format, setFormat] = useState(tournament?.format || 'football11');
  const [startDate, setStartDate] = useState(tournament?.startDate?.toDate?.().toISOString().split('T')[0] || '');
  const [logoUrl, setLogoUrl] = useState(tournament?.logoUrl || '');

  const handleSubmit = async () => {
    const data = {
      name,
      adminVkId: user.id,
      coAdmins: [user.id],
      type,
      format,
      startDate: new Date(startDate),
      logoUrl,
      createdAt: new Date()
    };

    const docRef = await addDoc(collection(db, 'tournaments'), data);
    onSaved({ ...data, id: docRef.id });
  };

  return (
    <Div>
      <FormLayout>
        <Input value={name} onChange={e => setName(e.target.value)} placeholder="Название турнира" />
        <Select value={type} onChange={e => setType(e.target.value)} options={[
          { label: 'Чемпионат', value: 'league' },
          { label: 'Кубок', value: 'cup' }
        ]} />
        <Select value={format} onChange={e => setFormat(e.target.value)} options={[
          { label: 'Футбол 11×11', value: 'football11' },
          { label: 'Мини-футбол 7×7', value: 'mini7' },
          { label: 'Футзал 5×5', value: 'futsal' }
        ]} />
        <Input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
        <LogoUrlInput currentLogo={logoUrl} onLogoUpdated={setLogoUrl} />
        <Button size="l" mode="primary" onClick={handleSubmit}>
          Создать турнир
        </Button>
      </FormLayout>
    </Div>
  );
};

export default TournamentEditor;