VERSION = 1.1.4.1
TAR = Plex-$(VERSION).tar
tar:	clean
	ln -s $(VERSION) ../Plex-$(VERSION)
	(cd ..; tar cvf $(TAR) Plex-$(VERSION)/*)
	rm ../Plex-$(VERSION)
	rm -f ../$(TAR).gz
	gzip ../$(TAR)

clean:
	rm -f */*.pyc *~ */*~ */*.dump tests/*.out2 tests/*.err

