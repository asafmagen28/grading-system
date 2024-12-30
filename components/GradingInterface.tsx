import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Download, Upload, Save } from 'lucide-react';

function GradingInterface() {
  const weights = {
    functionality: 35,
    design: 22,
    cpp: 23,
    conventions: 10,
    git: 10,
    bonus: 5
  };

  const initialStudents = [
    { id: 1, name: 'ליאל קידר' },
    { id: 2, name: 'איתי אמויאל' },
    { id: 3, name: 'ליאור אקסלרוד' },
    { id: 4, name: 'עידו בן זקן' },
    { id: 5, name: 'יריב ברגר' },
    { id: 6, name: 'נועם הוד' },
    { id: 7, name: 'חיים בנישו' },
    { id: 8, name: 'מתן שוכהנדלר' }
  ];

  const [selectedStudent, setSelectedStudent] = useState(null);
  const [savedFeedbacks, setSavedFeedbacks] = useState({});
  const [exportedData, setExportedData] = useState('');
  const [exerciseName, setExerciseName] = useState('');
  const [grades, setGrades] = useState({
    functionality: '',
    design: '',
    cpp: '',
    conventions: '',
    git: '',
    bonus: ''
  });
  const [comments, setComments] = useState({
    functionality: '',
    design: '',
    cpp: '',
    conventions: '',
    git: '',
    general: ''
  });
  const [finalFeedback, setFinalFeedback] = useState('');

  const handleStudentSelect = (student) => {
    setSelectedStudent(student.name);
    if (savedFeedbacks[student.name]) {
      const savedData = savedFeedbacks[student.name];
      setGrades(savedData.grades);
      setComments(savedData.comments);
      setFinalFeedback(savedData.feedback);
    } else {
      setGrades({
        functionality: '',
        design: '',
        cpp: '',
        conventions: '',
        git: '',
        bonus: ''
      });
      setComments({
        functionality: '',
        design: '',
        cpp: '',
        conventions: '',
        git: '',
        general: ''
      });
      setFinalFeedback('');
    }
  };

  const calculateFinalGrade = () => {
    let regularScore = 0;
    let bonusScore = 0;

    Object.entries(grades).forEach(([criterion, grade]) => {
      if (grade !== '' && criterion !== 'bonus' && weights[criterion]) {
        const numericGrade = parseFloat(grade);
        regularScore += (numericGrade / 4) * weights[criterion];
      }
    });

    if (grades.bonus && grades.bonus !== '') {
      const bonusGrade = parseFloat(grades.bonus);
      bonusScore = (bonusGrade / 4) * weights.bonus;
    }

    const normalizedRegularScore = (regularScore / 100) * 100;
    return Math.min(105, Math.round(normalizedRegularScore + bonusScore));
  };

  const generateFeedback = () => {
    const finalGrade = calculateFinalGrade();
    
    let feedback = `ציון סופי: ${finalGrade}\n\n`;
    feedback += 'הערות פונקציונאליות:\n';
    feedback += `${comments.functionality || ''}\n\n`;
    feedback += 'הערות Design:\n';
    feedback += `${comments.design || ''}\n\n`;
    feedback += 'הערות תכנות ב-C++:\n';
    feedback += `${comments.cpp || ''}\n\n`;
    feedback += 'הערות קונבנציות ותיעוד:\n';
    feedback += `${comments.conventions || ''}\n\n`;
    feedback += 'הערות עבודה עם Git:\n';
    feedback += `${comments.git || ''}\n\n`;
    feedback += 'הערות כלליות:\n';
    feedback += `${comments.general || ''}`;

    return feedback;
  };

  const saveFeedback = () => {
    const feedback = generateFeedback();
    setSavedFeedbacks(prev => ({
      ...prev,
      [selectedStudent]: {
        grades: {...grades},
        comments: {...comments},
        feedback
      }
    }));
    setFinalFeedback(feedback);
  };

  const handleGradeChange = (criterion, value) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      const numericValue = value === '' ? '' : parseFloat(value);
      if (numericValue === '' || (numericValue >= 0 && numericValue <= 4)) {
        setGrades(prev => ({ ...prev, [criterion]: value }));
      }
    }
  };

  const handleCommentChange = (criterion, value) => {
    setComments(prev => ({ ...prev, [criterion]: value }));
  };

  const copyFeedbackToClipboard = () => {
    try {
      const textArea = document.createElement('textarea');
      textArea.value = finalFeedback;
      textArea.style.position = 'fixed';
      textArea.style.opacity = '0';
      document.body.appendChild(textArea);
      textArea.select();
      
      document.execCommand('copy');
      
      document.body.removeChild(textArea);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      alert('לא ניתן להעתיק למערכת ההפעלה - נא להעתיק ידנית');
    }
  };

  const exportFeedback = () => {
    const exportData = {
      exerciseName,
      savedFeedbacks,
      timestamp: new Date().toISOString(),
      version: "1.0"
    };
    
    const formattedData = JSON.stringify(exportData, null, 2);
    setExportedData(formattedData);
    
    const fileName = exerciseName
      ? `${exerciseName.replace(/\s+/g, '_')}_feedback.json`
      : 'feedback.json';
    
    const blob = new Blob([formattedData], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const saveWithCustomName = () => {
    const exportData = {
      exerciseName,
      savedFeedbacks,
      timestamp: new Date().toISOString(),
      version: "1.0"
    };
    
    const formattedData = JSON.stringify(exportData, null, 2);
    
    // יצירת טקסט אריה זמני עם התוכן
    const textArea = document.createElement('textarea');
    textArea.value = formattedData;
    textArea.style.position = 'fixed';
    textArea.style.left = '-9999px'; // מחוץ למסך
    document.body.appendChild(textArea);
    
    // בחירת הטקסט
    textArea.select();
    textArea.setSelectionRange(0, 99999);
  
    // העתקה ללוח
    document.execCommand('copy');
    
    // ניקוי
    document.body.removeChild(textArea);
    
    // הודעה למשתמש
    alert('התוכן הועתק ללוח. אנא פתח תוכנת עריכה (כמו Notepad), הדבק את התוכן ושמור עם סיומת .json');
  };

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e: ProgressEvent<FileReader>) => {
        try {
          const result = e.target?.result;
          if (typeof result === 'string') {
            const importedData = JSON.parse(result);
            if (importedData.savedFeedbacks) {
              setSavedFeedbacks(importedData.savedFeedbacks);
              setExerciseName(importedData.exerciseName || '');
              setSelectedStudent(null);
              setGrades({
                functionality: '',
                design: '',
                cpp: '',
                conventions: '',
                git: '',
                bonus: ''
              });
              setComments({
                functionality: '',
                design: '',
                cpp: '',
                conventions: '',
                git: '',
                general: ''
              });
              setFinalFeedback('');
              setExportedData('');
              event.target.value = '';
            } else {
              alert('קובץ לא תקין - מבנה הנתונים אינו תואם');
            }
          } else {
            alert('שגיאה בקריאת הקובץ');
          }
        } catch (error) {
          alert('שגיאה בטעינת הקובץ');
          console.error('Import error:', error);
        }
      };
      reader.readAsText(file);
    }
  };

  return (
    <div className="container mx-auto p-4">
      <Card className="mb-4">
        <CardHeader>
          <CardTitle>פרטי התרגיל</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2">
            <Label>שם התרגיל:</Label>
            <Input
              type="text"
              value={exerciseName}
              onChange={(e) => setExerciseName(e.target.value)}
              placeholder="הזן את שם התרגיל"
              className="max-w-md"
              dir="rtl"
            />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
      <Card className="md:col-span-1">
        <CardHeader>
        <CardTitle>רשימת חניכים</CardTitle>
        <div className="flex gap-2 flex-wrap">
            <Button 
            variant="outline" 
            onClick={exportFeedback} 
            className="flex items-center gap-2 flex-1 min-w-[120px]"
            >
            <Download className="h-4 w-4" />
            ייצוא משובים
            </Button>
            <Button 
            variant="outline" 
            onClick={saveWithCustomName} 
            className="flex items-center gap-2 flex-1 min-w-[120px]"
            >
            <Save className="h-4 w-4" />
            שמור בשם
            </Button>
            <div className="relative flex-1 min-w-[120px]">
            <input
                type="file"
                accept=".json"
                onChange={handleFileImport}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                title="בחר קובץ JSON לייבוא"
            />
            <Button 
                variant="outline" 
                className="flex items-center gap-2 w-full"
            >
                <Upload className="h-4 w-4" />
                ייבוא משובים
            </Button>
            </div>
        </div>
        </CardHeader>
        <CardContent>
        <div className="space-y-2">
            {initialStudents.map((student) => (
            <div 
                key={student.id}
                className={`p-2 rounded cursor-pointer hover:bg-gray-100 ${
                selectedStudent === student.name ? 'bg-gray-100' : ''
                }`}
                onClick={() => handleStudentSelect(student)}
            >
                <div className="font-medium">{student.name}</div>
                {savedFeedbacks[student.name] && 
                <div className="text-sm text-gray-500">יש משוב שמור</div>
                }
            </div>
            ))}
        </div>
        </CardContent>
    </Card>

        {selectedStudent && (
          <div className="md:col-span-3 space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>הזנת ציונים והערות - {selectedStudent}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card>
                    <CardHeader>
                      <CardTitle>ציונים</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Object.entries({
                        functionality: 'פונקציונאליות',
                        design: 'Design',
                        cpp: 'תכנות ב-C++',
                        conventions: 'קונבנציות ותיעוד',
                        git: 'עבודה עם Git',
                        bonus: 'בונוס'
                      }).map(([key, label]) => (
                        <div key={key} className="space-y-1">
                          <Label>{label}</Label>
                          <div className="flex items-center gap-2">
                            <Input
                              type="text"
                              value={grades[key]}
                              onChange={e => handleGradeChange(key, e.target.value)}
                              placeholder="הזן ציון (0-4)"
                              className="flex-1"
                            />
                            <span className="text-sm text-gray-500">
                              ({weights[key]} נק')
                            </span>
                          </div>
                        </div>
                      ))}
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>הערות</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4">
                      {Object.entries({
                        functionality: 'הערות פונקציונאליות',
                        design: 'הערות Design',
                        cpp: 'הערות תכנות ב-C++',
                        conventions: 'הערות קונבנציות ותיעוד',
                        git: 'הערות עבודה עם Git',
                        general: 'הערות כלליות'
                      }).map(([key, label]) => (
                        <div key={key}>
                          <Label>{label}</Label>
                          <Textarea
                            value={comments[key]}
                            onChange={e => handleCommentChange(key, e.target.value)}
                            className="mt-1"
                            dir="rtl"
                          />
                        </div>
                      ))}
                    </CardContent>
                  </Card>
                </div>

                <div className="flex gap-2 mt-4">
                  <Button onClick={saveFeedback} className="flex-1">
                    שמור משוב
                  </Button>
                  {savedFeedbacks[selectedStudent] && (
                    <Button 
                      onClick={() => setFinalFeedback(savedFeedbacks[selectedStudent].feedback)} 
                      variant="outline"
                      className="flex-1"
                    >
                      הצג משוב
                    </Button>
                  )}
                  {finalFeedback && (
                    <Button onClick={copyFeedbackToClipboard} variant="outline">
                      <Copy className="h-4 w-4" />
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>

            {finalFeedback && (
              <Card>
                <CardHeader>
                  <CardTitle>משוב מסכם</CardTitle>
                </CardHeader>
                <CardContent>
                  <pre dir="rtl" className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                    {finalFeedback}
                  </pre>
                </CardContent>
              </Card>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

export { GradingInterface };