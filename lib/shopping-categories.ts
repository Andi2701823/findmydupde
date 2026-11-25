export type MerchantKey = "anthbot" | "imou" | "samsung" | "mactrade" | "joybuy" | "beauty";
export type ShoppingCategory = {
  slug:string; name:string; title:string; description:string; intro:string;
  sections:{heading:string;text:string}[]; checklist:string[];
  merchants:MerchantKey[]; guideSlugs:string[];
};
export const shoppingCategories:ShoppingCategory[] = [
  {
    "slug": "maehroboter",
    "name": "Mähroboter",
    "title": "Mähroboter kaufen: Modelle und Kaufkriterien",
    "description": "Mähroboter nach Rasenfläche, Navigation, Steigung und Zubehör einordnen. Erfahre, worauf du vor dem Kauf achten solltest.",
    "intro": "Ein Mähroboter sollte zu deinem Garten passen, nicht nur zu deinem Budget. Fläche, Engstellen, Steigungen und die Art der Navigation entscheiden darüber, welche Geräte sinnvoll sind.",
    "sections": [
      {
        "heading": "Fläche und Gelände richtig einschätzen",
        "text": "Miss die tatsächlich zu mähende Fläche einschließlich getrennter Zonen. Vergleiche die vom Hersteller angegebene Flächenleistung mit deiner Fläche und prüfe, ob steile Abschnitte, schmale Wege und unebene Stellen berücksichtigt werden."
      },
      {
        "heading": "Mit oder ohne Begrenzungskabel?",
        "text": "Kabelgebundene Geräte benötigen eine verlegte Begrenzung. Kabellose Modelle können etwa Satellitennavigation oder Kameras verwenden. Prüfe bei deinem Modell, ob eine Referenzstation nötig ist und wie Bäume, Gebäude oder enge Durchgänge die Navigation beeinflussen."
      },
      {
        "heading": "Folgekosten und Wartung",
        "text": "Berücksichtige Ersatzmesser, Akkus, Ladestation, mögliche Mobilfunkkosten und Winterlagerung. Prüfe auch, wie der Hersteller den Service bei Defekten organisiert."
      }
    ],
    "checklist": [
      "Rasenfläche und maximale Steigung messen",
      "Engstellen, Zonen und Ladestationsplatz prüfen",
      "Lieferumfang und laufende Kosten vergleichen",
      "Sicherheitsfunktionen und Betriebshinweise beachten"
    ],
    "merchants": [
      "anthbot"
    ],
    "guideSlugs": []
  },
  {
    "slug": "ueberwachungskameras",
    "name": "Überwachungskameras",
    "title": "Überwachungskameras kaufen: WLAN, Außenbereich & Speicher",
    "description": "Überwachungskameras nach Einsatzort, Stromversorgung, Nachtsicht und Speicher vergleichen. Kaufkriterien und passende Kameramodelle entdecken.",
    "intro": "Eine Kamera für die Haustür hat andere Anforderungen als ein Gerät für Innenräume oder einen Garten. Entscheidend sind der gewünschte Bildausschnitt, die Stromversorgung und der Umgang mit Aufnahmen.",
    "sections": [
      {
        "heading": "Innen- oder Außenkamera?",
        "text": "Für draußen muss das konkrete Modell für den vorgesehenen Einsatzort geeignet sein. Prüfe Schutzart, Temperaturbereich, Montage, Stromversorgung und ob die WLAN-Verbindung am Montageplatz stabil ist."
      },
      {
        "heading": "Bildqualität, Nachtsicht und Erkennung",
        "text": "Mehr Megapixel allein bedeuten nicht bessere Aufnahmen. Vergleiche Blickwinkel, Nachtsicht, Gegenlichtverhalten und die Funktionen zur Unterscheidung von Personen und anderen Bewegungen."
      },
      {
        "heading": "Speicher und Datenschutz",
        "text": "Prüfe, ob lokale Speicherung möglich ist, welche Funktionen ein Cloud-Abo voraussetzen und wie Updates bereitgestellt werden. Richte Kameras so aus, dass du die Privatsphäre Dritter respektierst; beachte die geltenden Datenschutzanforderungen."
      }
    ],
    "checklist": [
      "Montageort und WLAN-Empfang prüfen",
      "Stromversorgung und Nachtsicht vergleichen",
      "Speicherkosten und Abo-Funktionen prüfen",
      "Privatsphäre und Updateversorgung beachten"
    ],
    "merchants": [
      "imou"
    ],
    "guideSlugs": []
  },
  {
    "slug": "smartphones",
    "name": "Smartphones",
    "title": "Smartphones kaufen: Display, Akku und Speicher vergleichen",
    "description": "Smartphones nach Leistung, Display, Kamera, Akku und Updateversorgung einordnen. Finde passende Händlerkataloge und Kaufkriterien.",
    "intro": "Das teuerste Smartphone ist nicht automatisch das passende. Überlege zuerst, ob du vor allem fotografierst, spielst, arbeitest oder einfach ein zuverlässiges Gerät für den Alltag suchst.",
    "sections": [
      {
        "heading": "Display und Bedienung",
        "text": "Prüfe Größe, Helligkeit, Bildwiederholrate und Gewicht. Ein großes Display ist für Videos praktisch, kann aber in einer Hand unkomfortabel sein. Auch die Lesbarkeit draußen ist wichtig."
      },
      {
        "heading": "Speicher, Leistung und Updates",
        "text": "Schätze den Speicherbedarf für Fotos, Videos und Apps ab. Vergleiche bei konkreten Modellen die zugesagte Dauer der Sicherheitsupdates und die verfügbaren Speichergrößen."
      },
      {
        "heading": "Gesamtkosten statt Einstiegspreis",
        "text": "Vergleiche dieselbe Speichervariante, den Gerätezustand, Lieferumfang und Versand. Prüfe bei Verträgen außerdem Laufzeit, monatliche Kosten und einmalige Gebühren."
      }
    ],
    "checklist": [
      "Speicherbedarf und Displaygröße festlegen",
      "Updatezusagen des Modells prüfen",
      "Akkulaufzeit und Ladezubehör berücksichtigen",
      "Gleiche Modellvarianten und Gesamtkosten vergleichen"
    ],
    "merchants": [
      "samsung",
      "mactrade",
      "joybuy"
    ],
    "guideSlugs": [
      "powerbank-kaufen"
    ]
  },
  {
    "slug": "notebooks",
    "name": "Notebooks & MacBooks",
    "title": "Notebook kaufen: Leistung, RAM und Ausstattung vergleichen",
    "description": "Notebooks und MacBooks nach Arbeitsspeicher, Display, Anschlüssen, Akkulaufzeit und Einsatzbereich einordnen.",
    "intro": "Ein Notebook für Büroarbeit braucht andere Eigenschaften als ein Gerät für Videoschnitt oder unterwegs. Lege vor dem Kauf fest, welche Programme du regelmäßig nutzt und welche Anschlüsse du benötigst.",
    "sections": [
      {
        "heading": "Prozessor und Arbeitsspeicher",
        "text": "Vergleiche die Anforderungen deiner Programme mit der Ausstattung. Prüfe vor allem bei nicht aufrüstbaren Geräten, ob der Arbeitsspeicher und die SSD auch für die nächsten Jahre reichen."
      },
      {
        "heading": "Mobilität und Display",
        "text": "Gewicht, Ladegerät, Displaygröße und Akkulaufzeit spielen bei häufigem Transport eine große Rolle. Herstellerangaben zur Akkulaufzeit beziehen sich oft auf bestimmte Testbedingungen."
      },
      {
        "heading": "Anschlüsse, Betriebssystem und Zubehör",
        "text": "Prüfe Monitoranschlüsse, USB-Ports, Tastaturlayout und die Kompatibilität mit deiner Software. Rechne benötigte Adapter oder Dockingstationen zum Gesamtpreis hinzu."
      }
    ],
    "checklist": [
      "Anforderungen der wichtigsten Programme prüfen",
      "RAM und SSD passend dimensionieren",
      "Anschlüsse und Tastaturlayout kontrollieren",
      "Garantie, Zustand und Zubehör vergleichen"
    ],
    "merchants": [
      "mactrade",
      "samsung",
      "joybuy"
    ],
    "guideSlugs": []
  },
  {
    "slug": "fernseher",
    "name": "Fernseher",
    "title": "Fernseher kaufen: OLED, LCD, Größe und Ausstattung",
    "description": "Fernseher nach Bildschirmtechnik, Sitzabstand, Helligkeit, Gaming-Funktionen und Anschlüssen vergleichen.",
    "intro": "Die passende Bildschirmgröße hängt von deinem Sitzabstand und deiner Nutzung ab. Für helle Räume, Filme am Abend oder Konsolenspiele können unterschiedliche Eigenschaften wichtig sein.",
    "sections": [
      {
        "heading": "OLED oder LCD mit Quantenpunkten?",
        "text": "OLED-Pixel leuchten selbst und können sehr dunkle Bildbereiche darstellen. LCD-Fernseher nutzen eine Hintergrundbeleuchtung; Varianten mit Quantenpunkten oder Mini-LED unterscheiden sich je nach Modell. Vergleiche Helligkeit und Kontrast anhand konkreter Geräte."
      },
      {
        "heading": "Größe, Auflösung und Sitzabstand",
        "text": "Miss den Platz für Bildschirm und Standfuß. Berücksichtige die Auflösung deiner üblichen Inhalte und prüfe, ob der Fernseher an die vorgesehene Wandhalterung passt."
      },
      {
        "heading": "Gaming, Ton und Anschlüsse",
        "text": "Für Spiele können Bildwiederholrate, variable Bildrate und geringe Verzögerung wichtig sein. Prüfe die Anzahl geeigneter HDMI-Anschlüsse, eARC für externe Audiogeräte und die unterstützten Streaming-Apps."
      }
    ],
    "checklist": [
      "Platz und Sitzabstand messen",
      "Bildtechnik passend zur Raumhelligkeit wählen",
      "HDMI-Funktionen und Streaming-Apps prüfen",
      "Stromverbrauch und Zubehör berücksichtigen"
    ],
    "merchants": [
      "samsung",
      "joybuy"
    ],
    "guideSlugs": []
  },
  {
    "slug": "gesichtspflege",
    "name": "Gesichtspflege",
    "title": "Gesichtspflege kaufen: Produkte und Inhaltsstoffe vergleichen",
    "description": "Gesichtspflege nach Hautbedürfnis, Inhaltsstoffen, Füllmenge und Preis einordnen. Seren, Pflegeprodukte und Kaufhinweise entdecken.",
    "intro": "Gesichtspflege sollte zu deinen Hautbedürfnissen und deiner bestehenden Routine passen. Ein teures Produkt oder eine auffällige Verpackung ist kein Beleg für bessere Verträglichkeit.",
    "sections": [
      {
        "heading": "Pflegezweck und Verträglichkeit",
        "text": "Unterscheide Reinigung, Feuchtigkeitspflege und Sonnenschutz. Führe neue Produkte einzeln ein und beachte die Herstellerhinweise. Bei anhaltenden Hautproblemen ist fachlicher Rat sinnvoll."
      },
      {
        "heading": "Inhaltsstoffe richtig lesen",
        "text": "Die vollständige INCI-Liste hilft, Inhaltsstoffe zu erkennen. Sie verrät nicht automatisch die genaue Konzentration oder Wirksamkeit. Beachte bekannte individuelle Unverträglichkeiten."
      },
      {
        "heading": "Füllmenge und Preis vergleichen",
        "text": "Vergleiche ähnliche Produkttypen anhand der Menge und des Grundpreises. Pflege-Sets sind nur sinnvoll, wenn du die enthaltenen Produkte tatsächlich benötigst. Prüfe den aktuellen Preis im Shop."
      }
    ],
    "checklist": [
      "Pflegezweck festlegen",
      "INCI-Liste und Anwendungshinweise lesen",
      "Füllmenge und Grundpreis vergleichen",
      "Keine Wirkung allein aus dem Preis ableiten"
    ],
    "merchants": [
      "beauty",
      "joybuy"
    ],
    "guideSlugs": [
      "gesichtsserum-vergleichen",
      "sonnenschutz-kaufen"
    ]
  }
];
export const categoryPath = (slug:string) => "/kategorien/"+slug+"/";
export const findShoppingCategory = (slug:string) => shoppingCategories.find(c=>c.slug===slug);
