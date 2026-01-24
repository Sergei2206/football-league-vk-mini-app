import React, { useState } from 'react';
import { Div, FormLayout, Input, Button } from '@vkontakte/vkui';

interface LogoUrlInputProps {
  currentLogo?: string;
  onLogoUpdated: (url: string) => void;
}

const LogoUrlInput = ({ currentLogo, onLogoUpdated }: LogoUrlInputProps) => {
  const [url, setUrl] = useState(currentLogo || '');

  return (
    <Div>
      <FormLayout>
        <Input
          placeholder="URL логотипа (ImgBB)"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <Button size="s" mode="secondary" onClick={() => onLogoUpdated(url)}>
          Применить
        </Button>
        {url && <img src={url} width="80" style={{ marginTop: 8 }} />}
      </FormLayout>
    </Div>
  );
};

export default LogoUrlInput;