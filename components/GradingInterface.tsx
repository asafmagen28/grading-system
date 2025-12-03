import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Copy, Download, Upload, Save } from 'lucide-react';
import { motion } from 'framer-motion';

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
    { id: 2, name: 'אדם גרין' },
    { id: 3, name: 'אוריאן פרניק' },
    { id: 4, name: 'נועם מדיוני' },
    { id: 5, name: 'עידן מזור' },
    { id: 6, name: 'נועם קרוצ׳י' },
    { id: 7, name: 'איליי שטרית' },
    { id: 8, name: 'אלה נגאוקר' },
    { id:10, name: 'אראל וולוב' },
    { id:11, name: 'עידו ליברמן' },
    { id:12, name: 'עידו אלישע' },
    { id:13, name: 'מיכאל רומנובסקי' },
    { id:14, name: 'יניב שוחמן' },
    { id:15, name: 'אמילי ילצוב' }
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

  // Load data from localStorage on component mount
  useEffect(() => {
    const loadFromStorage = () => {
      try {
        const storedExerciseName = localStorage.getItem('exerciseName');
        const storedFeedbacks = localStorage.getItem('savedFeedbacks');
        
        if (storedExerciseName) {
          setExerciseName(storedExerciseName);
        }
        
        if (storedFeedbacks) {
          setSavedFeedbacks(JSON.parse(storedFeedbacks));
        }
      } catch (error) {
        console.error('Error loading from localStorage:', error);
      }
    };

    loadFromStorage();
  }, []);

  // Save to localStorage whenever relevant data changes
  // Save current student data whenever grades or comments change
  useEffect(() => {
    if (selectedStudent) {
      const feedback = generateFeedback();
      const newFeedbacks = {
        ...savedFeedbacks,
        [selectedStudent]: {
          grades: {...grades},
          comments: {...comments},
          feedback
        }
      };
      setSavedFeedbacks(newFeedbacks);
      setFinalFeedback(feedback);
    }
  }, [grades, comments]);

  // Save to localStorage whenever data changes
  useEffect(() => {
    try {
      localStorage.setItem('exerciseName', exerciseName);
      localStorage.setItem('savedFeedbacks', JSON.stringify(savedFeedbacks));
    } catch (error) {
      console.error('Error saving to localStorage:', error);
    }
  }, [exerciseName, savedFeedbacks]);

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
    const newFeedbacks = {
      ...savedFeedbacks,
      [selectedStudent]: {
        grades: {...grades},
        comments: {...comments},
        feedback
      }
    };
    setSavedFeedbacks(newFeedbacks);
    setFinalFeedback(feedback);
  };

  const clearAllData = () => {
    if (window.confirm('האם אתה בטוח שברצונך למחוק את כל הנתונים? פעולה זו בלתי הפיכה.')) {
      localStorage.clear();
      setSavedFeedbacks({});
      setExerciseName('');
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
    }
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

  const copyFeedbackToClipboard = (feedback = null) => {
    const textToCopy = feedback || finalFeedback;
    try {
      navigator.clipboard.writeText(textToCopy).catch(() => {
        // Fallback for older browsers
        const textArea = document.createElement('textarea');
        textArea.value = textToCopy;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      });
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      alert('לא ניתן להעתיק למערכת ההפעלה - נא להעתיק ידנית');
    }
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

  const exportFeedback = () => {
    const exportData = {
      exerciseName,
      savedFeedbacks,
      timestamp: new Date().toISOString(),
      version: "1.0"
    };
    
    const formattedData = JSON.stringify(exportData, null, 2);
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
    URL.revokeObjectURL(url);
    document.body.removeChild(link);
  };

  
  const handleFileImport = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const result = e.target.result;
          
          // Ensure that result is a string
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
              event.target.value = '';
            } else {
              alert('קובץ לא תקין - מבנה הנתונים אינו תואם');
            }
          } else {
            alert('שגיאה בטעינת הקובץ');
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
    <div className="min-h-screen bg-gradient-to-br from-sky-50 via-white to-blue-50 p-6">
      {/* Animated background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 right-0 w-96 h-96 bg-sky-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-blue-100 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-blob animation-delay-2000"></div>
      </div>
  
      {/* Main content */}
      <div className="relative">
        {/* Exercise Details Card */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <Card className="mb-6 backdrop-blur-lg bg-white/80 border border-white/20 shadow-lg">
            <CardHeader>
              <CardTitle className="text-2xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                פרטי התרגיל
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Label className="text-sky-900">שם התרגיל:</Label>
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
        </motion.div>
  
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {/* Students List */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <Card className="backdrop-blur-lg bg-white/80 border border-white/20 shadow-lg">
              <CardHeader>
                <CardTitle className="text-xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                  רשימת חניכים
                </CardTitle>
                <div className="flex gap-2 flex-wrap">
                  <Button 
                    variant="outline" 
                    onClick={exportFeedback} 
                    className="flex items-center gap-2 flex-1 min-w-[120px] text-sky-700 hover:bg-sky-50 transition-all duration-300"
                  >
                    <Download className="h-4 w-4" />
                    ייצוא לקובץ
                  </Button>
                  <Button 
                    variant="outline" 
                    onClick={saveWithCustomName} 
                    className="flex items-center gap-2 flex-1 min-w-[120px] text-sky-700 hover:bg-sky-50 transition-all duration-300"
                  >
                    <Save className="h-4 w-4" />
                    העתק JSON
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
                      className="flex items-center gap-2 w-full text-sky-700 hover:bg-sky-50 transition-all duration-300"
                    >
                      <Upload className="h-4 w-4" />
                      ייבוא משובים
                    </Button>
                  </div>
                  <Button 
                    variant="outline" 
                    onClick={clearAllData}
                    className="flex items-center gap-2 flex-1 min-w-[120px] text-sky-700 hover:bg-sky-50 transition-all duration-300"
                  >
                    נקה הכל
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {initialStudents.map((student) => (
                    <motion.div
                      key={student.id}
                      whileHover={{ scale: 1.02, x: 5 }}
                      className={`p-3 rounded-lg transition-all duration-200 flex items-center justify-between gap-2
                        ${selectedStudent === student.name
                          ? 'bg-sky-100 text-sky-900'
                          : 'hover:bg-sky-50'}`}
                    >
                      <div
                        className="flex-1 cursor-pointer"
                        onClick={() => handleStudentSelect(student)}
                      >
                        <div className="font-medium">{student.name}</div>
                        {savedFeedbacks[student.name] &&
                          <div className="text-sm text-sky-600 mt-1 flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-sky-500"></div>
                            יש משוב שמור
                          </div>
                        }
                      </div>
                      {savedFeedbacks[student.name] && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            copyFeedbackToClipboard(savedFeedbacks[student.name].feedback);
                          }}
                          className="h-8 w-8 p-0 hover:bg-sky-200"
                          title="העתק משוב"
                        >
                          <Copy className="h-4 w-4 text-sky-600" />
                        </Button>
                      )}
                    </motion.div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </motion.div>
  
          {/* Grading Area */}
          {selectedStudent && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
              className="md:col-span-3 space-y-6"
            >
              <Card className="backdrop-blur-lg bg-white/80 border border-white/20 shadow-lg">
                <CardHeader>
                  <CardTitle className="text-xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                    הזנת ציונים והערות - {selectedStudent}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Grades Section */}
                    <Card className="border border-sky-100">
                      <CardHeader className="bg-gradient-to-r from-sky-50 to-blue-50">
                        <CardTitle className="text-lg font-semibold text-sky-900">ציונים</CardTitle>
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
                          <motion.div
                            key={key}
                            whileHover={{ scale: 1.01 }}
                            className="space-y-1"
                          >
                            <Label className="text-sky-900">{label}</Label>
                            <div className="flex items-center gap-2">
                              <Input
                                type="text"
                                value={grades[key]}
                                onChange={e => handleGradeChange(key, e.target.value)}
                                placeholder="הזן ציון (0-4)"
                                className="flex-1"
                              />
                              <span className="text-sm text-sky-600">
                                ({weights[key]} נק')
                              </span>
                            </div>
                          </motion.div>
                        ))}
                      </CardContent>
                    </Card>
  
                    {/* Comments Section */}
                    <Card className="border border-sky-100">
                      <CardHeader className="bg-gradient-to-r from-sky-50 to-blue-50">
                        <CardTitle className="text-lg font-semibold text-sky-900">הערות</CardTitle>
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
                          <motion.div key={key} whileHover={{ scale: 1.01 }}>
                            <Label className="text-sky-900">{label}</Label>
                            <Textarea
                              value={comments[key]}
                              onChange={e => handleCommentChange(key, e.target.value)}
                              className="mt-1"
                              dir="rtl"
                            />
                          </motion.div>
                        ))}
                      </CardContent>
                    </Card>
                  </div>
  
                  {/* Action Buttons */}
                  <div className="flex gap-2 mt-6">
                  <Button 
                    onClick={saveFeedback}
                    className="flex-1 bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white transition-all duration-300 shadow-md hover:shadow-lg"
                  >
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
                      <Button 
                        onClick={copyFeedbackToClipboard}
                        variant="outline"
                      >
                        <Copy className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
  
              {/* Final Feedback Section */}
              {finalFeedback && (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                >
                  <Card className="backdrop-blur-lg bg-white/80 border border-white/20 shadow-lg">
                    <CardHeader>
                      <CardTitle className="text-xl font-bold bg-gradient-to-r from-sky-600 to-blue-600 bg-clip-text text-transparent">
                        משוב מסכם
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <pre dir="rtl" className="whitespace-pre-wrap bg-sky-50 p-4 rounded-lg text-sky-900">
                        {finalFeedback}
                      </pre>
                    </CardContent>
                  </Card>
                </motion.div>
              )}
            </motion.div>
          )}
        </div>
      </div>
    </div>
  );
}

export { GradingInterface };
