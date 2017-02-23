Summary:            Allows remote commands to be executed on the host
Name:               remote-control
Version:            0.1.0
Release:            1%{?dist}
License:            Copyright 2015 Sazze, Inc.  All rights reserved.
Group:              System Environment/Base
Source:             http://gitlab.sazze.com/ops/%{name}/repository/archive.tar.gz?ref=%{version}
URL:                http://gitlab.sazze.com/ops/%{name}/tree/%{version}
BuildRequires:      nodejs >= 0.12.0

%description
This is a service that allows command line commands to be run on the host it is running on.

It is distributed as a self contained package with all dependencies included.

%prep
%autosetup -n %{name}
npm install -g nar

%build
nar create --executable --os $RPM_OS --arch $RPM_ARCH --node 0.12.7

%install
%make_install

install -m 755 -d %{buildroot}/%{_sbindir}
ln -s ../bin/eject %{buildroot}/%{_sbindir}

%find_lang %{name}

%files -f %{name}.lang
%doc README TODO COPYING ChangeLog
%{_bindir}/*
%{_sbindir}/*
%{_mandir}/man1/*

%changelog
* Tue Feb 08 2011 Fedora Release Engineering <rel-eng@lists.fedoraproject.org> - 2.1.5-21
- Rebuilt for https://fedoraproject.org/wiki/Fedora_15_Mass_Rebuild

* Fri Jul 02 2010 Kamil Dudka <kdudka@redhat.com> 2.1.5-20
- handle multi-partition devices with spaces in mount points properly (#608502)