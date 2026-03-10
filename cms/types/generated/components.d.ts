import type { Schema, Struct } from '@strapi/strapi';

export interface DialogChoice extends Struct.ComponentSchema {
  collectionName: 'components_dialog_choices';
  info: {
    description: 'Eine Antwortoption in einem Dialog mit Verzweigung';
    displayName: 'Choice';
  };
  attributes: {
    nextNodeId: Schema.Attribute.Integer & Schema.Attribute.Required;
    savesAs: Schema.Attribute.String;
    text: Schema.Attribute.String & Schema.Attribute.Required;
  };
}

export interface JournalAudioPlayer extends Struct.ComponentSchema {
  collectionName: 'components_journal_audio_player';
  info: {
    description: 'Eine kurze Hoeraufgabe oder Audiodatei direkt im Notizbuch';
    displayName: 'Template: Audio Player';
  };
  attributes: {
    afterText: Schema.Attribute.RichText;
    audioFile: Schema.Attribute.Media<'files'> & Schema.Attribute.Required;
    audioTitle: Schema.Attribute.String & Schema.Attribute.Required;
    duration: Schema.Attribute.Integer;
    introText: Schema.Attribute.RichText;
    showWaveform: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<false>;
    subtitle: Schema.Attribute.RichText;
  };
}

export interface JournalExerciseEmbed extends Struct.ComponentSchema {
  collectionName: 'components_journal_exercise_embed';
  info: {
    description: 'Ein Sticker oder Button startet eine Uebung direkt aus dem Notizbuch heraus';
    displayName: 'Template: Uebung eingebettet';
  };
  attributes: {
    afterText: Schema.Attribute.RichText;
    exercise: Schema.Attribute.Relation<'oneToOne', 'api::exercise.exercise'> &
      Schema.Attribute.Required;
    introText: Schema.Attribute.RichText;
    stickerImage: Schema.Attribute.Media<'images'>;
    stickerLabel: Schema.Attribute.String &
      Schema.Attribute.DefaultTo<'Uebung starten'>;
    stickerX: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<50>;
    stickerY: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<60>;
  };
}

export interface JournalImageLayoutA extends Struct.ComponentSchema {
  collectionName: 'components_journal_image_layout_a';
  info: {
    description: 'Linke Seite: Bild. Rechte Seite: Text. Wie ein Fotoalbum.';
    displayName: 'Template: Bild Layout A (Bild links, Text rechts)';
  };
  attributes: {
    image: Schema.Attribute.Media<'images'> & Schema.Attribute.Required;
    imageCaption: Schema.Attribute.String;
    imageRotation: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<0>;
    text: Schema.Attribute.RichText & Schema.Attribute.Required;
  };
}

export interface JournalImageLayoutB extends Struct.ComponentSchema {
  collectionName: 'components_journal_image_layout_b';
  info: {
    description: 'Das Bild fuellt die gesamte Doppelseite. Text liegt darueber.';
    displayName: 'Template: Bild Layout B (Vollbild-Hintergrund mit Text)';
  };
  attributes: {
    backgroundImage: Schema.Attribute.Media<'images'> &
      Schema.Attribute.Required;
    overlayOpacity: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<0.3>;
    text: Schema.Attribute.RichText & Schema.Attribute.Required;
    textPosition: Schema.Attribute.Enumeration<['top', 'center', 'bottom']> &
      Schema.Attribute.DefaultTo<'top'>;
  };
}

export interface JournalStickerPlacement extends Struct.ComponentSchema {
  collectionName: 'components_journal_sticker_placements';
  info: {
    description: 'Ein Sticker auf einer Journal-Seite mit Positions- und Groessenangabe';
    displayName: 'Sticker Placement';
  };
  attributes: {
    asset: Schema.Attribute.Relation<'oneToOne', 'api::cave-asset.cave-asset'>;
    rotation: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<0>;
    scale: Schema.Attribute.Decimal & Schema.Attribute.DefaultTo<1>;
    x: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      >;
    y: Schema.Attribute.Decimal &
      Schema.Attribute.Required &
      Schema.Attribute.SetMinMax<
        {
          max: 100;
          min: 0;
        },
        number
      >;
    zIndex: Schema.Attribute.Integer & Schema.Attribute.DefaultTo<1>;
  };
}

export interface JournalTextOnly extends Struct.ComponentSchema {
  collectionName: 'components_journal_text_only';
  info: {
    description: "Noen's Tagebucheintrag \u2013 nur handschriftlicher Text, keine Medien";
    displayName: 'Template: Nur Text';
  };
  attributes: {
    author: Schema.Attribute.Enumeration<['noen', 'toni', 'user']> &
      Schema.Attribute.DefaultTo<'noen'>;
    showLines: Schema.Attribute.Boolean & Schema.Attribute.DefaultTo<true>;
    text: Schema.Attribute.RichText & Schema.Attribute.Required;
  };
}

export interface JournalVideo extends Struct.ComponentSchema {
  collectionName: 'components_journal_video';
  info: {
    description: 'Ein Video direkt im Notizbuch \u2013 Upload oder externer Link (z.B. Vimeo)';
    displayName: 'Template: Video';
  };
  attributes: {
    afterText: Schema.Attribute.RichText;
    caption: Schema.Attribute.String;
    introText: Schema.Attribute.RichText;
    videoFile: Schema.Attribute.Media<'videos'>;
    videoPoster: Schema.Attribute.Media<'images'>;
    videoSource: Schema.Attribute.Enumeration<['upload', 'vimeo', 'youtube']> &
      Schema.Attribute.Required &
      Schema.Attribute.DefaultTo<'upload'>;
    videoUrl: Schema.Attribute.String;
  };
}

declare module '@strapi/strapi' {
  export module Public {
    export interface ComponentSchemas {
      'dialog.choice': DialogChoice;
      'journal.audio-player': JournalAudioPlayer;
      'journal.exercise-embed': JournalExerciseEmbed;
      'journal.image-layout-a': JournalImageLayoutA;
      'journal.image-layout-b': JournalImageLayoutB;
      'journal.sticker-placement': JournalStickerPlacement;
      'journal.text-only': JournalTextOnly;
      'journal.video': JournalVideo;
    }
  }
}
